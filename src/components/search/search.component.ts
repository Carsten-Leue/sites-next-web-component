import { Query, RenderingContextV2 } from '@acoustic-content-sdk/api';
import { deepEquals, luceneEscapeTerm } from '@acoustic-content-sdk/utils';
import {
  ACOUSTIC_DELIVERY_SEARCH_RESOLVER,
  ACOUSTIC_LOGGER_SERVICE
} from '@acoustic-content-sdk/web-components-services';
import {
  combineLatest,
  fromEvent,
  merge,
  Observable,
  ReplaySubject
} from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  pluck,
  scan,
  share,
  switchMap,
  takeUntil,
  tap
} from 'rxjs/operators';

import formTemplate from './search.form.html';
import itemTemplate from './search.result.html';

const logger = ACOUSTIC_LOGGER_SERVICE.get('SearchComponent');

const createSearchQuery = (aValue: string): Query => ({
  q: `name:*${luceneEscapeTerm(aValue)}*`,
  fl: 'name',
  rows: 100,
  sort: 'lastModified desc'
});

interface SearchItem {
  name: string;
}

const EMPTY_ITEMS: SearchItem[] = [];

/**
 * Implementation of a web component that executes a search query for content item.
 *
 * The component is based on string based html templates and uses rxjs for its interactivity
 */
export class SearchComponent extends HTMLElement {
  private readonly renderingContext$ = new ReplaySubject<RenderingContextV2>(1);

  private readonly init$ = new ReplaySubject<HTMLElement>(1);

  private readonly done$ = new ReplaySubject<void>(1);

  set renderingContext(value: RenderingContextV2) {
    this.renderingContext$.next(value);
  }

  constructor() {
    super();

    const log = <T>(msg: string) => tap<T>(data => logger.info(msg, data));

    const createTemplate = (aTmp: string): Observable<DocumentFragment> =>
      this.init$.pipe(
        map(el => el.ownerDocument!.createElement('template')),
        map(tmp => {
          tmp.innerHTML = aTmp;
          return tmp;
        }),
        pluck('content')
      );

    const form$ = createTemplate(formTemplate);
    const item$ = createTemplate(itemTemplate);

    // use RX to create the markup
    const node$ = combineLatest([form$, item$]).pipe(
      map(([root, item]) => {
        // select the elements
        const input = root.querySelector<HTMLInputElement>(
          'input[name="search"]'
        )!;
        const results = root.querySelector<HTMLInputElement>(
          'ul[name="results"]'
        )!;
        // return
        return { root, input, item, results };
      }),
      share()
    );
    // listen for search input
    const searchText$ = node$.pipe(
      switchMap(({ input }) => fromEvent(input, 'input')),
      map(event => event.target! as HTMLInputElement),
      map(input => input.value.trim()),
      distinctUntilChanged(),
      debounceTime(250),
      log('text')
    );
    // search something
    const searchResult$: Observable<SearchItem[]> = searchText$.pipe(
      map(createSearchQuery),
      switchMap(query =>
        ACOUSTIC_DELIVERY_SEARCH_RESOLVER.getDeliverySearchResults<SearchItem>(
          query,
          'content'
        )
      ),
      map(results => results.documents || EMPTY_ITEMS),
      distinctUntilChanged(deepEquals),
      log('searchResult')
    );
    // create the nodes
    const resultNode$ = combineLatest([searchResult$, node$]).pipe(
      map(([results, { item }]) =>
        results.map(({ name }) => {
          const resultItem = item.cloneNode(true) as DocumentFragment;
          const li = resultItem.querySelector<HTMLLIElement>(
            'li[name="item"]'
          )!;
          li.innerText = name;
          return li;
        })
      ),
      log('li')
    );
    // append the form
    const root$ = node$.pipe(
      scan((oldChild: DocumentFragment | undefined, { root }) => {
        oldChild && this.removeChild(oldChild);
        return this.appendChild(root);
      }, undefined)
    );
    // result list
    const formWithResult$ = combineLatest([node$, resultNode$]).pipe(
      log('formWithResults'),
      scan((oldChildren: HTMLLIElement[], [{ results }, nodes]) => {
        // log this
        console.log('old', oldChildren, 'new', nodes, 'result', results);
        // remove old children
        oldChildren.forEach(child => results.removeChild(child));
        // insert new children
        nodes.forEach(child => results.appendChild(child));
        return nodes;
      }, [])
    );

    // merge all
    const all$ = merge(root$, formWithResult$);

    // log this
    all$.pipe(takeUntil(this.done$)).subscribe();
  }

  connectedCallback() {
    this.init$.next(this);
  }

  disconnectedCallback() {
    this.done$.next();
  }
}
