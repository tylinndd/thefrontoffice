from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    supabase_url: str
    supabase_anon_key: str
    supabase_service_key: str
    supabase_jwt_secret: str
    odds_api_key: str
    gemini_api_key: str = ""

    odds_api_base_url: str = "https://api.the-odds-api.com/v4"
    nba_season: str = "2025-26"
    default_last_n_games: int = 15


settings = Settings()  # type: ignore[call-arg]
