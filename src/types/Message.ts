enum ContentType {
    TEXT = "text",
    IMAGE = "image",
    AUDIO = "audio",
    VIDEO = "video",
    FILE = "file"
}

export interface Message {
    _id?: string;
    content?: string;
    sender: string | {
      _id?: string;
      username?: string;
      firstName?: string;
      lastName?: string;
      profile?: any;
    };
    senderName?: string;
    chatId?: string;
    contentType?: ContentType;
    recieverSeen?: string[];
    type: "newUser" | "message";
    createdAt?: Date | string;
    updatedAt?: Date | string;
}