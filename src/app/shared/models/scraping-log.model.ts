export interface CategoryData {
  category_name: string;
}

export interface ScrapingLog {
  scraping_id: number;
  page: number | null;
  number_of_books: number;
  scraped_at: string;
  category_id: string | null;
  category: CategoryData | null;
}