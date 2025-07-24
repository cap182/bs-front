export interface Category {
  category_name: string;
}

export interface Book {
  book_id: string;
  title: string;
  price: number;
  rating: number; // 1-5
  img: string;
  stock: boolean;
  stock_quantity: number | null;
  categoryId: string;
  category: Category;
}

export interface BooksApiResponse {
  data: Book[];
  total: number;
  page: number;
  limit: number;
}