from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from flask_cors import CORS
from bson.objectid import ObjectId
import numpy as np

app = Flask(__name__)
CORS(app)

# Σύνδεση στη MongoDB (το database name είναι eshop)
app.config["MONGO_URI"] = "mongodb://localhost:27017/eshop"
mongo = PyMongo(app)
products_col = mongo.db.products

# Endpoint /search
@app.route('/search', methods=['GET'])
def search_products():
    name = request.args.get('name', '').strip()
    query = {}
    if name == '':
        # Κενή παράμετρος -> όλα τα προϊόντα
        query = {}
    else:
        # Αναζήτηση με χρήση regex (case insensitive)
        query = {"name": {"$regex": name, "$options": "i"}}
    
    # Βρες τα προϊόντα
    products = list(products_col.find(query))
    if len(products) > 1:
        # Αν βρεθούν περισσότερα από 1, ταξινόμησε κατά φθίνουσα σειρά τιμής
        products = sorted(products, key=lambda x: x.get('price', 0), reverse=True)
    
    # Μετατροπή _id σε string και επιστροφή JSON
    for p in products:
        p['_id'] = str(p['_id'])
    return jsonify(products)

# Endpoint /like
@app.route('/like', methods=['POST'])
def like_product():
    data = request.get_json(force=True)
    prod_id = data.get('id')
    if not prod_id:
        return jsonify({"error": "Missing product id"}), 400
    
    try:
        result = products_col.update_one(
            {"_id": ObjectId(prod_id)},
            {"$inc": {"likes": 1}}
        )
        if result.matched_count == 0:
            return jsonify({"error": "Product not found"}), 404
        return jsonify({"message": "Like added"})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Endpoint /popular-products
@app.route('/popular-products', methods=['GET'])
def popular_products():
    # Βρες top 5 με βάση τα likes, φθίνουσα σειρά
    products = list(products_col.find().sort("likes", -1).limit(5))
    for p in products:
        p['_id'] = str(p['_id'])
    return jsonify(products)

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000)
