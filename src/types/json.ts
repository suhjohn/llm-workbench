export declare interface JsonArray extends Array<JsonValue> {}
export declare type JsonObject = {
  [Key in string]?: JsonValue;
};

export declare type JsonValue =
  | string
  | number
  | boolean
  | JsonObject
  | JsonArray
  | null;
