from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from flask_cors import CORS
from bson.objectid import ObjectId
import numpy as np

app = Flask(__name__)
CORS(app)

# Βάλε εδώ το connection string από το MongoDB Atlas (άλλαξε user, pass, dbname)
app.config["MONGO_URI"] = "mongodb+srv://euangelostsipras:02m5AxYB3IJef0vq@cluster0.npy0hl1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

mongo = PyMongo(app)
products_col = mongo.db.products

# Δημιουργία text index στο πεδίο name (τρέχει 1 φορά)
@app.before_first_request
def create_indexes():
    products_col.create_index([("name", "text")])

@app.route('/search', methods=['GET'])
def search_products():
    name = request.args.get('name', '')

    if name == '':
        # Επιστρέφουμε όλα τα προϊόντα
        prods = list(products_col.find())
    else:
        # Αναζήτηση με text index
        cursor = products_col.find({"$text": {"$search": name}})
        prods = list(cursor)

    # Αν βρούμε πολλά με το ίδιο όνομα (exact match), φιλτράρουμε ακριβώς
    if len(prods) > 1:
        exact_matches = [p for p in prods if name.lower() == p['name'].lower()]
        if exact_matches:
            prods = exact_matches

    # Ταξινόμηση κατά φθίνουσα τιμή
    prods = sorted(prods, key=lambda x: x.get('price', 0), reverse=True)

    # Μετατροπή ObjectId σε string για JSON
    for p in prods:
        p['_id'] = str(p['_id'])

    return jsonify(prods)

@app.route('/like', methods=['POST'])
def like_product():
    data = request.get_json()
    prod_id = data.get('id')

    if not prod_id:
        return jsonify({"error": "Missing product id"}), 400

    result = products_col.update_one(
        {"_id": ObjectId(prod_id)},
        {"$inc": {"likes": 1}}
    )

    if result.matched_count == 0:
        return jsonify({"error": "Product not found"}), 404

    return jsonify({"message": "Like added successfully"})

@app.route('/popular-products', methods=['GET'])
def popular_products():
    prods = list(products_col.find().sort("likes", -1).limit(5))

    for p in prods:
        p['_id'] = str(p['_id'])

    return jsonify(prods)

if __name__ == '__main__':
    app.run(host="127.0.0.1", port=5000, debug=True)
