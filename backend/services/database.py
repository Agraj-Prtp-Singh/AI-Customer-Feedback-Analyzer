from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")

# Creates the connection to MongoDb
client = MongoClient(MONGODB_URI)

# Creates/Selectt a database called customer_feedback
db = client["customer_feedback"]

# select/creates a collection called feedback
feedback_collection = db["feedback"]

