import AppTags from './tags';
import AppPosts from './posts';
import AppCategories from './categories';
import AppAuthors from './authors';

// 应用核心命名空间
declare global {
  namespace App {
    export import Tags = AppTags;
    export import Posts = AppPosts;
    export import Categories = AppCategories;
    export import Authors = AppAuthors;
  }
}
