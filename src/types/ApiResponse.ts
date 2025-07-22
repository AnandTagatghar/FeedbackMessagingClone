export type ApiResponse = {
  status: boolean;
  statusCode: number;
  message: string;
  isAcceptingMessages?: boolean;
  messages?: [];
};
