<?php

/**
 *    Copyright 2016 ppy Pty. Ltd.
 *
 *    This file is part of osu!web. osu!web is distributed with the hope of
 *    attracting more community contributions to the core ecosystem of osu!.
 *
 *    osu!web is free software: you can redistribute it and/or modify
 *    it under the terms of the Affero GNU General Public License version 3
 *    as published by the Free Software Foundation.
 *
 *    osu!web is distributed WITHOUT ANY WARRANTY; without even the implied
 *    warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 *    See the GNU Affero General Public License for more details.
 *
 *    You should have received a copy of the GNU Affero General Public License
 *    along with osu!web.  If not, see <http://www.gnu.org/licenses/>.
 */
namespace App\Transformers;

use App\Models\Contest;
use League\Fractal;
use DB;

class ContestTransformer extends Fractal\TransformerAbstract
{
    public function transform(Contest $contest)
    {
        return [
            'id' => $contest->id,
            'name' => $contest->name,
            'description' => $contest->description,
            'type' => $contest->type,
            'header_url' => $contest->header_url,
            'max_votes' => $contest->max_votes,
            'ends_at' => $contest->ends_at->toIso8601String(),
            'winner_votes' => $contest->votes()->select(DB::raw('count(*) as votes'))->groupBy('contest_entry_id')->orderBy('votes', 'desc')->limit(1)->first()->votes, //todo: cleanup
            'total_votes' => $contest->votes->count(),
            'show_votes' => $contest->show_votes,
        ];
    }
}
