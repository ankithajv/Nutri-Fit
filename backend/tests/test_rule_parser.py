from __future__ import annotations

import pytest
from core.nlp.rule_parser import parse_meal_text
from core.nlp.quantity_parser import parse_quantity_token

def test_parse_quantity_tokens():
    assert parse_quantity_token("1") == 1.0
    assert parse_quantity_token("2.5") == 2.5
    assert parse_quantity_token("half") == 0.5
    assert parse_quantity_token("quarter") == 0.25
    assert parse_quantity_token("a") == 1.0
    assert parse_quantity_token("an") == 1.0
    assert parse_quantity_token("one") == 1.0
    assert parse_quantity_token("two") == 2.0
    assert parse_quantity_token("ten") == 10.0
    assert parse_quantity_token("1/2") == 0.5
    assert parse_quantity_token("3/4") == 0.75
    assert parse_quantity_token("1 1/2") == 1.5

def test_parse_multi_item_meal():
    text = "2 idli, 1 bowl sambar, 1 cup coffee"
    parsed = parse_meal_text(text)
    assert len(parsed) == 3

    assert parsed[0]["name"] == "idli"
    assert parsed[0]["quantity"] == 2.0
    assert parsed[0]["unit"] == "piece"

    assert parsed[1]["name"] == "sambar"
    assert parsed[1]["quantity"] == 1.0
    assert parsed[1]["unit"] == "bowl"

    assert parsed[2]["name"] == "coffee"
    assert parsed[2]["quantity"] == 1.0
    assert parsed[2]["unit"] == "cup"

def test_parse_word_quantities_and_fractions():
    text = "half bowl curd, 2 chapatis and 1 1/2 glass buttermilk"
    parsed = parse_meal_text(text)
    assert len(parsed) == 3

    assert parsed[0]["name"] == "curd"
    assert parsed[0]["quantity"] == 0.5
    assert parsed[0]["unit"] == "bowl"

    assert parsed[1]["name"] == "chapati"
    assert parsed[1]["quantity"] == 2.0
    assert parsed[1]["unit"] == "piece"

    assert parsed[2]["name"] == "buttermilk"
    assert parsed[2]["quantity"] == 1.5
    assert parsed[2]["unit"] == "glass"

def test_parse_single_item_default():
    text = "aloo paratha"
    parsed = parse_meal_text(text)
    assert len(parsed) == 1
    assert parsed[0]["name"] == "aloo paratha"
    assert parsed[0]["quantity"] == 1.0
    assert parsed[0]["unit"] == "piece"
