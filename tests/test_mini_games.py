"""Pruebas de lógica de Sudoku y contratos REST de juegos mentales."""
import unittest
import app as module


class MiniGamesApiTests(unittest.TestCase):
    def setUp(self):
        module.app.config["TESTING"] = True
        self.client = module.app.test_client()

    def test_sudoku_daily_is_deterministic(self):
        self.assertEqual(module._sudoku_daily("2026-11-23"), module._sudoku_daily("2026-11-23"))

    def test_sudoku_solution_valid(self):
        board, solved = module._sudoku_daily("2026-11-23")
        expected = set(range(1, 10))
        self.assertEqual(len(board), 9)
        self.assertTrue(any(0 in row for row in board))
        for i in range(9):
            self.assertEqual(set(solved[i]), expected)
            self.assertEqual({solved[r][i] for r in range(9)}, expected)
        for r in (0, 3, 6):
            for c in (0, 3, 6):
                self.assertEqual({solved[y][x] for y in range(r,r+3) for x in range(c,c+3)}, expected)

    def test_daily_does_not_leak_solution(self):
        data = self.client.get("/api/juegos/sudoku/diario").get_json()
        self.assertIn("tablero", data)
        self.assertNotIn("solucion", data)

    def test_reject_invalid_board(self):
        response = self.client.post("/api/juegos/sudoku/comprobar", json={"tablero": [[1]]})
        self.assertEqual(response.status_code, 400)

    def test_reject_modified_clues(self):
        from datetime import date
        board, _ = module._sudoku_daily(date.today().isoformat())
        board = [row[:] for row in board]
        for r in range(9):
            for c in range(9):
                if board[r][c]:
                    board[r][c] = board[r][c] % 9 + 1
                    self.assertEqual(self.client.post("/api/juegos/sudoku/comprobar", json={"tablero": board}).status_code, 400)
                    return
        self.fail("No hay pistas")

    def test_accept_solution(self):
        from datetime import date
        _, solved = module._sudoku_daily(date.today().isoformat())
        response = self.client.post("/api/juegos/sudoku/comprobar", json={"tablero": solved})
        self.assertTrue(response.get_json()["completo"])

    def test_game_configuration(self):
        data = self.client.get("/api/juegos/configuracion").get_json()
        self.assertEqual(data["2048"]["objetivo"], 2048)
        self.assertEqual(data["simon"]["colores"], 4)


if __name__ == "__main__":
    unittest.main()
