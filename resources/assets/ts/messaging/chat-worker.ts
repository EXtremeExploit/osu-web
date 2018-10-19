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

import {ChatChannelSwitchAction, ChatMessageAddAction, ChatMessageSendAction, ChatMessageUpdateAction} from 'actions/chat-actions';
import DispatcherAction from 'actions/dispatcher-action';
import { WindowBlurAction, WindowFocusAction } from 'actions/window-focus-actions';
import DispatchListener from 'dispatch-listener';
import Dispatcher from 'dispatcher';
import { transaction } from 'mobx';
import Channel from 'models/chat/channel';
import Message, { MessageJSON } from 'models/chat/message';
import RootDataStore from 'stores/root-data-store';
import ChatAPI from './chat-api';

export default class ChatWorker implements DispatchListener {
  private dispatcher: Dispatcher;
  private rootDataStore: RootDataStore;

  private pollingEnabled: boolean = true;
  private pollTime: number = 1000;
  private pollTimeIdle: number = 5000;
  private windowIsActive: boolean = true;

  private updateTimerId?: number;

  private api: ChatAPI;

  private updateXHR: boolean;

  constructor(dispatcher: Dispatcher, rootDataStore: RootDataStore) {
    this.dispatcher = dispatcher;
    this.rootDataStore = rootDataStore;
    this.dispatcher.register(this);
    this.api = new ChatAPI();

    this.startPolling();
  }

  handleDispatchAction(action: DispatcherAction) {
    if (action instanceof ChatMessageSendAction) {
      this.sendMessage(action.message);
    }

    if (action instanceof WindowFocusAction) {
      this.windowActive();
    }

    if (action instanceof WindowBlurAction) {
      this.windowIdle();
    }
  }

  markAsRead(channelId: number) {
    const channel: Channel = this.rootDataStore.channelStore.getOrCreate(channelId);
    const lastRead: number = channel.lastMessageId;

    if (!lastRead || channel.lastReadId >= lastRead) {
      console.log('markAsRead', 'up to date, doing nothing');
      return;
    }
    console.group('markAsRead', channel.channelId, lastRead, '=>', channel.lastReadId);

    this.api.markAsRead(channel.channelId, lastRead)
      .then(() => {
        channel.lastReadId = lastRead;
      })
      .catch((err) => {
        console.log('error idk', err);
      });
  }

  addMessages(channelId: number, messages: MessageJSON[]) {
    const newMessages: Message[] = [];

    transaction(() => {
      _.forEach(messages, (json: MessageJSON) => {
        const newMessage: Message = Message.fromJSON(json);
        newMessage.sender = this.rootDataStore.userStore.getOrCreate(json.sender_id, json.sender);
        // newMessage.channel = this.rootDataStore.channelStore.getOrCreate(json.channel_id);
        newMessages.push(newMessage);
      });

      this.rootDataStore.channelStore.addMessages(channelId, newMessages);
    });
  }

  sendMessage(message: Message) {
    console.log('ChatOrchestrator::sendMessage', message);

    const channel: Channel = message.channel;
    const channelId: number = channel.channelId;

    if (channel.newChannel) {
      const users = channel.users.slice();
      const userId = users.find((user) => {
        return user !== currentUser.id;
      });

      if (!userId) {
        console.log('sendMessage:: userId not found??');
        return;
      }

      console.log('api.createChannel(', userId, ', ', message, ')');
      this.api.createChannel(userId, message.content)
        .then((response) => {
          console.log('api.createChannel ->', response);
          const newId = response.new_channel_id;
          transaction(() => {
            this.rootDataStore.channelStore.channels.delete(channelId);
            // this.rootDataStore.channelStore.updatePresence(response.presence);
            this.dispatcher.dispatch(new ChatChannelSwitchAction(newId));
          });
        });
    } else {
      this.api.postMessage(channelId, message.content)
        .then((updateJson) => {
          if (updateJson) {
            message.message_id = updateJson.message_id;
          } else {
            message.errored = true;
          }
          this.dispatcher.dispatch(new ChatMessageUpdateAction(message));
        })
        .catch((err) => {
          message.errored = true;
          this.dispatcher.dispatch(new ChatMessageUpdateAction(message));
        });
    }
  }

  pollForUpdates = () => {
    if (this.updateXHR) {
      return;
    }
    this.updateXHR = true;

    this.api.getUpdates(this.rootDataStore.channelStore.maxMessageId)
    .then((updateJson) => {
      this.updateXHR = false;
      if (this.pollingEnabled) {
        this.updateTimerId = Timeout.set(this.pollingTime(), this.pollForUpdates);
      }

      if (!updateJson) {
        return;
      }

      transaction(() => {
        _.forEach(updateJson.messages, (message: MessageJSON) => {

          const newMessage = Message.fromJSON(message);
          newMessage.channel = this.rootDataStore.channelStore.getOrCreate(message.channel_id);
          newMessage.sender = this.rootDataStore.userStore.getOrCreate(message.sender_id, message.sender);
          this.dispatcher.dispatch(new ChatMessageAddAction(newMessage));
        });

        this.rootDataStore.channelStore.updatePresence(updateJson.presence);
      });
    })
    .catch((err) => {
      console.log('error idk', err);
      this.updateXHR = false;
      if (this.pollingEnabled) {
        this.updateTimerId = Timeout.set(this.pollingTime(), this.pollForUpdates);
      }
    });
  }

  startPolling() {
    if (!this.updateTimerId) {
      this.updateTimerId = Timeout.set(this.pollingTime(), this.pollForUpdates);
    }
  }

  pollingTime(): number {
    return this.windowIsActive ? this.pollTime : this.pollTimeIdle;
  }

  stopPolling() {
    if (this.updateTimerId) {
      Timeout.clear(this.updateTimerId);
      this.updateTimerId = undefined;
      this.updateXHR = false;
    }
  }

  windowIdle = () => {
    this.windowIsActive = false;
  }

  windowActive = () => {
    this.windowIsActive = true;
  }
}
