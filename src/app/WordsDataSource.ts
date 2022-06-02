import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, Observable } from 'rxjs';
import { DictionaryService } from './dictionary.service';
import WordData from './WordDTO';

export class WordsDataSource implements DataSource<WordData> {
  private words1 = new BehaviorSubject<WordData[]>([]);
  private loading = new BehaviorSubject<boolean>(false);
  private numberOfWords = new BehaviorSubject<number>(0);

  public loadingObs = this.loading.asObservable();
  public number$ = this.numberOfWords.asObservable();

  constructor(private dictionaryService: DictionaryService) {}

  connect(collectionViewer: CollectionViewer): Observable<WordData[]> {
    return this.words1.asObservable();
  }
  disconnect(collectionViewer: CollectionViewer): void {
    this.words1.complete();
    this.loading.complete();
    this.numberOfWords.complete();
  }

  loadWords(): void {
    this.loading.next(true);
    this.dictionaryService.getWordsList().subscribe((wordsList) => {
      this.loading.next(false);
      this.words1.next(wordsList);
      this.numberOfWords.next(wordsList?.length);
    });
  }

  loadFilteredWords(filter: string): void {
    this.loading.next(true);
    this.dictionaryService
      .getFilteredWordsList(filter)
      .subscribe((wordsList) => {
        this.loading.next(false);
        this.words1.next(wordsList);
      });
  }
}
