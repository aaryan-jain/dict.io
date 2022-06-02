import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map, delay } from 'rxjs';
import WordData from './WordDTO';
import ResponseObject from './ResponseObjectDTO';

var globalWordArr: Array<string> = [
  'Superman',
  'Batman',
  'Flash',
  'Wonderwoman',
];
const host_name = 'http://localhost:9000/';

@Injectable({
  providedIn: 'root',
})
export class DictionaryService {
  constructor(private http: HttpClient) {}

  // NEED TO PUT HTTP CALLS INSTEAD OF SET TIMEOUT

  fetchWordsFromServer(): Observable<any> {
    return this.http.get(host_name + 'words/all-words', {});
  }

  fetchFilteredWordsFromServer(filter: string): Observable<WordData[]> {
    return this.http
      .get(host_name + 'words/find-by-substring/' + filter, {})
      .pipe(
        map((element: any) => {
          if (element) {
            return element.map((ele: any) => {
              if (ele.word && ele.id) {
                let wordTemp: WordData = { id: ele.id, word: ele.word };
                return wordTemp;
              }
              return [];
            });
          }
        })
      );
  }

  deleteWordFromServer(word: WordData): Observable<string> {
    return this.http.delete(host_name + 'words/' + word.id, {
      responseType: 'text',
    });
  }

  deleteAllWordsFromServer(): Observable<string> {
    return this.http
      .delete(host_name + 'words', { responseType: 'text' })
      .pipe(map((e) => JSON.stringify(e)));
  }

  getWordsList(): Observable<WordData[]> {
    return this.fetchWordsFromServer().pipe(
      map((element) => {
        if (element?.length) {
          return element.map((ele: any) => {
            if (ele.word && ele.id) {
              let wordTemp: WordData = { id: ele.id, word: ele.word };
              return wordTemp;
            }
            return [];
          });
        }
      })
    );
  }

  getFilteredWordsList(filter: string): Observable<WordData[]> {
    return this.fetchFilteredWordsFromServer(filter);
  }

  saveWord(object: {
    update: number;
    word: string;
  }): Observable<ResponseObject> {
    const url = host_name + 'words/';
    if (object.update > 0) {
      return this.http.put(url + object.update, object, {}).pipe(
        map((element: any) => {
          let dummyResponse: ResponseObject = {
            message: element?.message,
            error: element?.error,
            word: element?.word,
          };
          return dummyResponse;
        })
      );
    } else {
      return this.http.post(url + 'save', { word: object.word }, {}).pipe(
        map((element: any) => {
          let dummyResponse: ResponseObject = {
            message: element?.message,
            error: element?.error,
            word: element?.word,
          };
          return dummyResponse;
        })
      );
    }
  }
}
