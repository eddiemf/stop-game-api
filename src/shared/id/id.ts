import cryptoRandomString from 'crypto-random-string';

export class Id {
  public static createSlug() {
    return cryptoRandomString({ length: 5, type: 'base64' });
  }

  public static createID() {
    return cryptoRandomString({ length: 20 });
  }
}
