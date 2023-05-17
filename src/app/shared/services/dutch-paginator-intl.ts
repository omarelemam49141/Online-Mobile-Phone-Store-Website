import { MatPaginatorIntl } from '@angular/material/paginator';

const dutchRangeLabel = (page: number, pageSize: number, length: number) => {

  if (length == 0 || pageSize == 0) {
    return `0 from ${length}`;
  }

  length = Math.max(length, 0);

  const startIndex = page * pageSize;

  // If the start index exceeds the list length, do not try and fix the end index to the end.
  const endIndex =
    startIndex < length
      ? Math.min(startIndex + pageSize, length)
      : startIndex + pageSize;
    
    return `${startIndex + 1} - ${endIndex} from ${length}`;
};

const dutchRangeLabelArabic = (page: number, pageSize: number, length: number) => {

  if (length == 0 || pageSize == 0) {
    return `0 from ${length}`;
  }

  length = Math.max(length, 0);

  const startIndex = page * pageSize;

  // If the start index exceeds the list length, do not try and fix the end index to the end.
  const endIndex =
    startIndex < length
      ? Math.min(startIndex + pageSize, length)
      : startIndex + pageSize;

    
    return `${startIndex + 1} - ${endIndex} from ${length}`;
};

export function getDutchPaginatorIntl(lang) {
    if (lang == 'arabic') {
        let paginatorIntl = new MatPaginatorIntl();
        paginatorIntl.itemsPerPageLabel = 'عدد المنتجات فى الصفحة:';
        paginatorIntl.nextPageLabel = 'التالية';
        paginatorIntl.previousPageLabel = 'السابقة';
        paginatorIntl.getRangeLabel = dutchRangeLabelArabic;
        return paginatorIntl;
    } else {
        let paginatorIntl2 = new MatPaginatorIntl();
        paginatorIntl2.itemsPerPageLabel = 'Items in page:';
        paginatorIntl2.nextPageLabel = 'next';
        paginatorIntl2.previousPageLabel = 'previous';
        paginatorIntl2.getRangeLabel = dutchRangeLabelArabic;
        return paginatorIntl2;
    }
}
