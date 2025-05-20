import json
from pymongo import MongoClient

MONGO_URI = "mongodb+srv://<username>:<password>@cluster0.mongodb.net/eshop_db?retryWrites=true&w=majority"

client = MongoClient(MONGO_URI)
db = client['eshop_db']
collection = db['products']

with open('products.json', 'r', encoding='utf-8') as file:
    products = json.load(file)

result = collection.insert_many(products)
print(f"Εισήχθησαν {len(result.inserted_ids)} προϊόντα στη βάση.")
