/**
 *    Copyright 2015-2018 ppy Pty. Ltd.
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

import { inject, observer } from 'mobx-react';
import Channel from 'models/chat/channel';
import * as React from 'react';
import ConversationListItem from './conversation-list-item';

@inject('dataStore')
@observer
export default class ConversationList extends React.Component<any, {}> {
  render(): React.ReactNode {
    const conversations: Channel[] = this.props.dataStore.channelStore.sortedByPresence;
    const conversationList: React.ReactNode[] = [];

    conversations.forEach((conversation) => {
      conversationList.push(
        <ConversationListItem
            key={conversation.channelId}
            channel_id={conversation.channelId}
        />,
      );
    });

    return(
      <div className='messaging__conversation-list'>
        {_.isEmpty(conversationList) ? (
          <div className='messaging__conversation-list-item'>{osu.trans('messages.no-conversations')}</div>
        ) : (
          conversationList
        )}
      </div>
    );
  }
}
