import json
import time
import logging
from typing import Optional, Any
from app.config import settings

logger = logging.getLogger("satyalens.cache")

class InMemoryCache:
    def __init__(self):
        self._store = {}

    def get(self, key: str) -> Optional[str]:
        item = self._store.get(key)
        if not item:
            return None
        val, expiry = item
        if expiry and time.time() > expiry:
            del self._store[key]
            return None
        return val

    def set(self, key: str, value: str, ttl: int = 600) -> None:
        expiry = time.time() + ttl if ttl else None
        self._store[key] = (value, expiry)

    def delete(self, key: str) -> None:
        self._store.pop(key, None)

    def clear(self) -> None:
        self._store.clear()

class CacheManager:
    def __init__(self):
        self.redis_client = None
        self.in_memory = InMemoryCache()
        self._init_redis()

    def _init_redis(self):
        if settings.REDIS_URL:
            try:
                import redis
                client = redis.from_url(settings.REDIS_URL, decode_responses=True)
                client.ping()
                self.redis_client = client
                logger.info("Connected to Redis cache successfully.")
            except Exception as e:
                logger.warning(f"Could not connect to Redis at {settings.REDIS_URL} ({e}). Falling back to in-memory cache.")
                self.redis_client = None
        else:
            logger.info("No Redis URL specified. Using high-performance in-memory cache.")

    def get_json(self, key: str) -> Optional[Any]:
        raw = self.get(key)
        if raw:
            try:
                return json.loads(raw)
            except Exception:
                return None
        return None

    def set_json(self, key: str, value: Any, ttl: int = 600) -> None:
        try:
            serialized = json.dumps(value)
            self.set(key, serialized, ttl)
        except Exception as e:
            logger.error(f"Failed to serialize cache value for key {key}: {e}")

    def get(self, key: str) -> Optional[str]:
        if self.redis_client:
            try:
                return self.redis_client.get(key)
            except Exception as e:
                logger.warning(f"Redis get error, falling back to memory: {e}")
        return self.in_memory.get(key)

    def set(self, key: str, value: str, ttl: int = 600) -> None:
        if self.redis_client:
            try:
                self.redis_client.set(key, value, ex=ttl)
                return
            except Exception as e:
                logger.warning(f"Redis set error, falling back to memory: {e}")
        self.in_memory.set(key, value, ttl)

    def delete(self, key: str) -> None:
        if self.redis_client:
            try:
                self.redis_client.delete(key)
            except Exception:
                pass
        self.in_memory.delete(key)

cache = CacheManager()
