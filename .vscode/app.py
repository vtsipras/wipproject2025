from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from flask_cors import CORS
from bson.objectid import ObjectId
import numpy as np

app = Flask(__name__)
CORS(app)

# Ρύθμιση σύνδεσης με MongoDB
app.config["MONGO_URI"] = "mongodb://localhost:27017/eshop"
mongo = PyMongo(app)
products_collection = mongo.db.products

# ========== /search ==========
@app.route('/search', methods=['GET'])
def search_products():
    name = request.args.get('name', '').strip()
    
    if name == "":
        # Επιστρέφει όλα τα προϊόντα
        products = products_collection.find()
    elif " " in name:
        # Πλήρης αντιστοίχιση (π.χ. "Paper A3")
        products = products_collection.find({ "name": name })
    else:
        # Αναζήτηση λέξης (π.χ. "Paper")
        products = products_collection.find({ "$text": { "$search": name } })

    # Φιλτράρισμα και ταξινόμηση κατά τιμή φθίνουσα
    result = sorted([
        {
            "_id": str(p["_id"]),
            "name": p.get("name", ""),
            "description": p.get("description", ""),
            "image": p.get("image", ""),
            "price": p.get("price", 0),
            "likes": p.get("likes", 0)
        } for p in products
    ], key=lambda x: -x["price"])

    return jsonify(result)

# ========== /like ==========
@app.route('/like', methods=['POST'])
def like_product():
    data = request.get_json()
    product_id = data.get("id")
    if not product_id:
        return jsonify({"error": "Missing product ID"}), 400

    try:
        result = products_collection.update_one(
            {"_id": ObjectId(product_id)},
            {"$inc": {"likes": 1}}
        )
        if result.matched_count == 0:
            return jsonify({"error": "Product not found"}), 404
        return jsonify({"message": "Like added successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ========== /popular-products ==========
@app.route('/popular-products', methods=['GET'])
def popular_products():
    top_products = products_collection.find().sort("likes", -1).limit(5)
    result = [
        {
            "_id": str(p["_id"]),
            "name": p.get("name", ""),
            "description": p.get("description", ""),
            "image": p.get("image", ""),
            "price": p.get("price", 0),
            "likes": p.get("likes", 0)
        } for p in top_products
    ]
    return jsonify(result)

# ========== Main ==========
if __name__ == '__main__':
    app.run(host="127.0.0.1", port=5000, debug=True)
