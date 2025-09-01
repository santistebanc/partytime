import type * as Party from "partykit/server";
import {
  UserManager,
  QuizManager,
  MessageHandler,
  ConnectionManager
} from "./server";

export default class RoomServer implements Party.Server {
  private userManager: UserManager;
  private quizManager: QuizManager;
  private messageHandler: MessageHandler;
  private connectionManager: ConnectionManager;

  constructor(readonly room: Party.Room) {
    this.userManager = new UserManager(room);
    this.quizManager = new QuizManager(room);
    this.messageHandler = new MessageHandler(this.userManager, this.quizManager, room);
    this.connectionManager = new ConnectionManager(this.userManager, room);
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
