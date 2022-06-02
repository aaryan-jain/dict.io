import WordData from './WordDTO';

export default interface ResponseObject {
  error: boolean;
  message: string;
  word?: WordData;
}
