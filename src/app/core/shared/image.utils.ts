import {
  Observable,
  of,
} from 'rxjs';
import { map } from 'rxjs/operators';

export const getDefaultImageUrlByEntityType = (entityType: string): Observable<string> => {
  const fallbackImage = '/assets/images/file-placeholder.svg';

  if (!entityType) {
    return of(fallbackImage);
  }

  const type = entityType.toLowerCase();
  const defaultImage = `/assets/images/${type}-placeholder.svg`;

  // For known institutional entity types, we return the path directly to avoid SSR detection issues
  const knownTypes = ['project', 'person', 'orgunit', 'funding', 'award'];
  if (knownTypes.includes(type)) {
    return of(defaultImage);
  }

  return checkImageExists(defaultImage).pipe(map((exists) => exists ? defaultImage : fallbackImage));
};

const checkImageExists = (url: string): Observable<boolean> =>  {
  return new Observable<boolean>((observer) => {
    // Basic check: if it's already a known asset or we are on browser
    if (typeof Image === 'undefined') {
       observer.next(true); // Assume it exists on server to avoid flickering
       observer.complete();
       return;
    }

    const img = new Image();
    img.onload = () => {
      observer.next(true);
      observer.complete();
    };

    img.onerror = () => {
      observer.next(false);
      observer.complete();
    };

    img.src = url;
  });
};
