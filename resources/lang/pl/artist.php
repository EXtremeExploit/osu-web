<?php

// Copyright (c) ppy Pty Ltd <contact@ppy.sh>. Licensed under the GNU Affero General Public License v3.0.
// See the LICENCE file in the repository root for full licence text.

return [
    'page_description' => 'Wyróżnieni wykonawcy osu!',
    'title' => 'Wyróżnieni artyści',

    'admin' => [
        'hidden' => 'ARTYSTA JEST OBECNIE UKRYTY',
    ],

    'beatmaps' => [
        '_' => 'Beatmapy',
        'download' => 'pobierz szablon beatmapy',
        'download-na' => 'szablon beatmapy nie jest jeszcze dostępny',
    ],

    'index' => [
        'description' => 'Wyróżnieni wykonawcy to osoby z którymi współpracujemy, by zapewnić społeczności osu! oryginalną muzykę - część artystów stworzyła utwory wyłączne dla naszej gry! Zarówno oni sami, jak i ich utwory, zostali starannie wybrani przez członków zespołu osu!, głównie za ich odlotowość oraz łatwość w tworzeniu beatmap.<br><br>Wszystkie utwory w tej sekcji występują w formie plików o rozszerzeniu .osz z odpowiednio ustawionym rytmem. Utwory są oficjalnie licencjonowane dla osu! i rzeczy z nim powiązanych.',
    ],

    'links' => [
        'beatmaps' => 'Powiązane beatmapy',
        'osu' => 'Konto osu!',
        'site' => 'Oficjalna strona internetowa',
    ],

    'songs' => [
        '_' => 'Utwory',
        'count' => ':count utwór|:count utwory|:count utworów',
        'original' => 'ekskluzywny dla osu!',
        'original_badge' => 'EKSKLUZYWNY',
    ],

    'tracklist' => [
        'title' => 'tytuł',
        'length' => 'długość',
        'bpm' => 'bpm',
        'genre' => 'gatunek',
    ],

    'tracks' => [
        'index' => [
            '_' => 'wyszukiwarka utworów',

            'form' => [
                'advanced' => 'Wyszukiwanie zaawansowane',
                'album' => 'Album',
                'artist' => 'Artysta',
                'bpm_gte' => 'Minimalne BPM',
                'bpm_lte' => 'Maksymalne BPM',
                'empty' => 'Brak utworów spełniających wybrane kryteria wyszukiwania.',
                'genre' => 'Gatunek',
                'genre_all' => 'Wszystkie',
                'length_gte' => 'Minimalna długość',
                'length_lte' => 'Maksymalna długość',
            ],
        ],
    ],
];
