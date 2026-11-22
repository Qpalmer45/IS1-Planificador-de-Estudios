"""Pruebas de API de escudos sin depender de la conexión externa."""
import io
import json
import unittest
from unittest.mock import patch
import app as app_module


class TestEscudos(unittest.TestCase):
    def setUp(self):
        app_module.app.config["TESTING"] = True
        self.client = app_module.app.test_client()
        app_module._club_cache.clear()

    def test_liga_no_permitida(self):
        response = self.client.get("/api/perfil/escudos?liga=otro")
        self.assertEqual(response.status_code, 400)

    def test_catalogo_y_cache(self):
        payload = {"sports": [{"leagues": [{"teams": [
            {"team": {"id": "359", "displayName": "Arsenal", "logos": [{"href": "https://example.org/arsenal.png"}]}},
            {"team": {"id": "123", "displayName": "Otro", "logos": []}}
        ]}]}]}
        class Response:
            def __enter__(self):
                return io.BytesIO(json.dumps(payload).encode("utf-8"))
            def __exit__(self, *args):
                pass
        with patch("urllib.request.urlopen", return_value=Response()) as urlopen:
            first = self.client.get("/api/perfil/escudos?liga=eng.1")
            second = self.client.get("/api/perfil/escudos?liga=eng.1")
        self.assertEqual(first.status_code, 200)
        self.assertEqual(first.json["equipos"][0]["nombre"], "Arsenal")
        self.assertEqual(len(first.json["equipos"]), 1)
        self.assertEqual(second.status_code, 200)
        self.assertEqual(urlopen.call_count, 1)

    def test_error_externo_devuelve_503(self):
        with patch("urllib.request.urlopen", side_effect=OSError("Sin red")):
            response = self.client.get("/api/perfil/escudos?liga=esp.2")
        self.assertEqual(response.status_code, 503)


if __name__ == "__main__":
    unittest.main()
