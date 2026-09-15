import os


DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:123456@localhost:5434/geobrasil",
)
