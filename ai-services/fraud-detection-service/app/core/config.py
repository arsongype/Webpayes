from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:arson@localhost:5432/monorepo_db"
    MODEL_PATH: str = "app/models/trained/fraud_xgboost_v1.pkl"
    API_KEY: str = "changeme"
    
    class Config:
        env_file = ".env"

settings = Settings()
