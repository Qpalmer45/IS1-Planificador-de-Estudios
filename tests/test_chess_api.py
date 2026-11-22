"""HU44: pruebas de lógica del backend sin conexiones de red."""
import unittest
from unittest.mock import patch
import app as module


class ChessApiTests(unittest.TestCase):
    def setUp(self):
        module.app.config["TESTING"] = True
        module._chess_cache.clear()
        self.client = module.app.test_client()
        self.puzzles = [
            {"id": str(i), "fen": "k7/8/1QK5/8/8/8/8/8 w - - 0 1",
             "color": "white", "rating": 900, "move": "b6b7"}
            for i in range(5)
        ]

    def test_daily_returns_five_without_answers(self):
        with patch.object(module, "_chess_daily_set", return_value=self.puzzles):
            response = self.client.get("/api/ajedrez/diario")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()["ejercicios"]
        self.assertEqual(len(data), 5)
        self.assertNotIn("move", data[0])

    def test_correct_move(self):
        with patch.object(module, "_chess_daily_set", return_value=self.puzzles):
            response = self.client.post("/api/ajedrez/comprobar", json={"id": "0", "movimiento": "b6b7"})
        self.assertTrue(response.get_json()["correcto"])

    def test_wrong_move(self):
        with patch.object(module, "_chess_daily_set", return_value=self.puzzles):
            response = self.client.post("/api/ajedrez/comprobar", json={"id": "0", "movimiento": "b6a6"})
        self.assertFalse(response.get_json()["correcto"])

    def test_unknown_puzzle(self):
        with patch.object(module, "_chess_daily_set", return_value=self.puzzles):
            response = self.client.post("/api/ajedrez/comprobar", json={"id": "missing", "movimiento": "b6b7"})
        self.assertEqual(response.status_code, 404)

    def test_bad_request(self):
        response = self.client.post("/api/ajedrez/comprobar", json={"id": "0", "movimiento": 123})
        self.assertEqual(response.status_code, 400)

    def test_external_failure(self):
        with patch.object(module, "_chess_daily_set", side_effect=OSError("offline")):
            self.assertEqual(self.client.get("/api/ajedrez/diario").status_code, 503)

    def test_external_api_down_uses_five_local_puzzles(self):
        with patch.object(module, "_chess_fetch_json", side_effect=OSError("offline")):
            response = self.client.get("/api/ajedrez/diario")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()["ejercicios"]
        self.assertEqual(len(data), 5)
        self.assertTrue(all(item["fen"] for item in data))
        self.assertNotIn("move", data[0])

    def test_cache_daily(self):
        with patch.object(module, "_chess_fetch_json") as fetch:
            fetch.side_effect = [
                [{"id": str(i), "positionFen": "k7/8/1QK5/8/8/8/8/8 w - - 0 1",
                  "solverColor": "white", "rating": 900} for i in range(5)],
                *[{"solution": ["b6b7"]} for _ in range(5)]
            ]
            a = module._chess_daily_set("2026-11-22")
            b = module._chess_daily_set("2026-11-22")
        self.assertEqual(a, b)
        self.assertEqual(fetch.call_count, 6)


if __name__ == "__main__":
    unittest.main()
