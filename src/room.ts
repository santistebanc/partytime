import type * as Party from "partykit/server";
import { GameStateManager } from "./server/GameStateManager";
import { MessageHandler } from "./server/MessageHandler";
import { ConnectionManager } from "./server/ConnectionManager";

export default class RoomServer implements Party.Server {
  private gameStateManager: GameStateManager;
  private messageHandler: MessageHandler;
  private connectionManager: ConnectionManager;

  constructor(readonly room: Party.Room) {
    this.gameStateManager = new GameStateManager(room);
    this.messageHandler = new MessageHandler(this.gameStateManager, room);
    this.connectionManager = new ConnectionManager(this.gameStateManager, room);
  }

  async onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    await this.connectionManager.onConnect(conn, ctx);
  }

  async onMessage(message: string, sender: Party.Connection) {
    await this.messageHandler.handleMessage(message, sender);
  }

  async onClose(conn: Party.Connection) {
    await this.connectionManager.onClose(conn);
  }
}
