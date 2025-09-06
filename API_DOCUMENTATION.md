# Palets Art Gallery API Documentation

## Base URL
```
http://localhost:8001/api
```

## Authentication
The API uses different authentication methods:
- **Admin routes**: Token-based authentication (Bearer token)
- **User routes**: Session-based authentication (web middleware)
- **Public routes**: No authentication required

---

## Table of Contents

1. [Test Endpoints](#test-endpoints)
2. [Admin Authentication](#admin-authentication)
3. [User Authentication](#user-authentication)
4. [Cart Management](#cart-management)
5. [Public Content](#public-content)
6. [Admin Content Management](#admin-content-management)

---

## Test Endpoints

### GET /test
Test API connectivity (GET method)

**Response:**
```json
{
  "message": "API GET is working"
}
```

### POST /test
Test API connectivity (POST method)

**Response:**
```json
{
  "message": "API POST is working"
}
```

---

## Admin Authentication

### POST /admin/login
Admin login

**Parameters:**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response (Success):**
```json
{
  "token": "base64_encoded_token",
  "user": {
    "id": 1,
    "name": "Admin Name",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

**Response (Error):**
```json
{
  "message": "The provided credentials are incorrect."
}
```

### POST /admin/logout
Admin logout

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "message": "Successfully logged out"
}
```

### GET /admin/me
Get authenticated admin details

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "name": "Admin Name",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

---

## User Authentication

### POST /auth/register
User registration

**Parameters:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "country_code": "+1"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Registration successful",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "avatar": null
  }
}
```

### POST /auth/login
User login

**Parameters:**
```json
{
  "email": "john@example.com",
  "password": "password123",
  "remember": false
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "avatar": null
  }
}
```

### POST /auth/logout
User logout (requires authentication)

**Response:**
```json
{
  "success": true,
  "message": "Successfully logged out"
}
```

### GET /auth/me
Get authenticated user details

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+1234567890",
    "country_code": "+1",
    "date_of_birth": null,
    "gender": null,
    "avatar": null,
    "street_address": null,
    "city": null,
    "state": null,
    "postal_code": null,
    "country": null,
    "billing_street_address": null,
    "billing_city": null,
    "billing_state": null,
    "billing_postal_code": null,
    "billing_country": null,
    "newsletter_subscription": false,
    "sms_notifications": false,
    "preferred_language": "en",
    "timezone": "UTC"
  }
}
```

### PUT /auth/profile
Update user profile (requires authentication)

**Parameters (multipart/form-data):**
```json
{
  "name": "John Smith",
  "first_name": "John",
  "last_name": "Smith",
  "phone": "+1234567890",
  "country_code": "+1",
  "date_of_birth": "1990-01-01",
  "gender": "male",
  "street_address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "postal_code": "10001",
  "country": "USA",
  "newsletter_subscription": true,
  "sms_notifications": false,
  "preferred_language": "en",
  "timezone": "America/New_York",
  "avatar": "file_upload"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    // Updated user object
  }
}
```

---

## Cart Management

### GET /cart
Get user's cart

**Response:**
```json
{
  "success": true,
  "items": [
    {
      "id": 1,
      "product_id": 9,
      "product_type": "product",
      "product_slug": "art-panel-title",
      "quantity": 2,
      "price": 99.99,
      "total": 199.98,
      "product_title": "Beautiful Art Panel",
      "product_image": "http://localhost:8001/storage/100/image.jpg",
      "options": {},
      "available": true,
      "artist": {
        "id": 1,
        "artist_name": "Artist Name"
      },
      "added_at": "2025-01-01T12:00:00.000Z"
    }
  ],
  "summary": {
    "items_count": 2,
    "subtotal": 199.98,
    "tax": 20.00,
    "shipping": 9.99,
    "total": 229.97
  }
}
```

### POST /cart/add
Add item to cart

**Parameters:**
```json
{
  "product_id": 9,
  "product_type": "product",
  "quantity": 1,
  "options": {}
}
```

**Response:**
```json
{
  "success": true,
  "items": [
    // Updated cart items
  ],
  "summary": {
    // Updated cart summary
  }
}
```

### PUT /cart/update
Update cart item quantity

**Parameters:**
```json
{
  "item_id": 1,
  "quantity": 3
}
```

**Response:**
```json
{
  "success": true,
  "items": [
    // Updated cart items
  ],
  "summary": {
    // Updated cart summary
  }
}
```

### DELETE /cart/remove
Remove item from cart

**Parameters:**
```json
{
  "item_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "items": [
    // Updated cart items
  ],
  "summary": {
    // Updated cart summary
  }
}
```

### DELETE /cart/clear
Clear entire cart

**Response:**
```json
{
  "success": true,
  "message": "Cart cleared successfully",
  "items": [],
  "summary": {
    "items_count": 0,
    "subtotal": 0,
    "tax": 0,
    "shipping": 9.99,
    "total": 9.99
  }
}
```

### POST /cart/merge
Merge guest cart with user cart (requires authentication)

**Response:**
```json
{
  "success": true,
  "items": [
    // Merged cart items
  ],
  "summary": {
    // Updated cart summary
  }
}
```

---

## Public Content

### GET /public/artists
Get list of artists

**Query Parameters:**
- `search` (string): Search term
- `active` (boolean): Filter by active status
- `sort_by` (string): Sort field (default: created_at)
- `sort_direction` (string): Sort direction (asc/desc, default: desc)
- `per_page` (integer): Items per page (default: 8)
- `page` (integer): Page number

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "artist_name": "Vincent van Gogh",
      "bio": "Dutch post-impressionist painter...",
      "link": "https://example.com",
      "slug": "vincent-van-gogh",
      "is_active": true,
      "social_links": {
        "instagram": "@artist",
        "facebook": "artist"
      },
      "contact_email": "artist@example.com",
      "phone": "+1234567890",
      "specialties": "Oil painting, Portraits",
      "commission_rate": 15.00,
      "avatar_url": "http://localhost:8001/storage/1/avatar.jpg",
      "avatar_thumb_url": "http://localhost:8001/storage/1/conversions/avatar-thumb.jpg",
      "works_count": 25,
      "published_works_count": 20,
      "created_at": "2025-01-01T12:00:00.000000Z",
      "updated_at": "2025-01-01T12:00:00.000000Z"
    }
  ],
  "current_page": 1,
  "per_page": 8,
  "total": 10,
  "last_page": 2
}
```

### GET /public/artists/{slug}
Get single artist details

**Response:**
```json
{
  "id": 1,
  "artist_name": "Vincent van Gogh",
  "bio": "Dutch post-impressionist painter...",
  "link": "https://example.com",
  "slug": "vincent-van-gogh",
  "is_active": true,
  "social_links": {
    "instagram": "@artist",
    "facebook": "artist"
  },
  "contact_email": "artist@example.com",
  "phone": "+1234567890",
  "specialties": "Oil painting, Portraits",
  "commission_rate": 15.00,
  "avatar_url": "http://localhost:8001/storage/1/avatar.jpg",
  "avatar_thumb_url": "http://localhost:8001/storage/1/conversions/avatar-thumb.jpg",
  "gallery_images": [
    {
      "id": 1,
      "url": "http://localhost:8001/storage/1/gallery1.jpg",
      "thumb_url": "http://localhost:8001/storage/1/conversions/gallery1-thumb.jpg"
    }
  ],
  "works_count": 25,
  "published_works_count": 20,
  "created_at": "2025-01-01T12:00:00.000000Z",
  "updated_at": "2025-01-01T12:00:00.000000Z"
}
```

### GET /public/artists/{slug}/works
Get artist's works

**Query Parameters:**
- `per_page` (integer): Items per page (default: 12)
- `page` (integer): Page number

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "artist_id": 1,
      "title": "Starry Night",
      "description": "Famous painting...",
      "year_created": "1889",
      "medium": "Oil on canvas",
      "dimensions": {
        "width": "73.7 cm",
        "height": "92.1 cm"
      },
      "price": 1000000.00,
      "is_for_sale": false,
      "is_featured": true,
      "slug": "starry-night",
      "status": "published",
      "tags": ["impressionism", "night", "stars"],
      "like_count": 150,
      "view_count": 1000,
      "cover_image_url": "http://localhost:8001/storage/1/starry-night.jpg",
      "cover_image_thumb_url": "http://localhost:8001/storage/1/conversions/starry-night-thumb.jpg",
      "artist": {
        "id": 1,
        "artist_name": "Vincent van Gogh",
        "slug": "vincent-van-gogh"
      },
      "created_at": "2025-01-01T12:00:00.000000Z",
      "updated_at": "2025-01-01T12:00:00.000000Z"
    }
  ],
  "current_page": 1,
  "per_page": 12,
  "total": 25,
  "last_page": 3
}
```

### GET /public/works
Get list of artworks

**Query Parameters:**
- `search` (string): Search term
- `artist_id` (integer): Filter by artist
- `status` (string): Filter by status
- `is_for_sale` (boolean): Filter by sale status
- `is_featured` (boolean): Filter by featured status
- `tags` (string): Filter by tags (comma-separated)
- `min_price` (number): Minimum price filter
- `max_price` (number): Maximum price filter
- `sort_by` (string): Sort field (default: created_at)
- `sort_direction` (string): Sort direction (asc/desc, default: desc)
- `per_page` (integer): Items per page (default: 12)
- `page` (integer): Page number

**Response:**
```json
{
  "data": [
    // Array of artwork objects (same structure as above)
  ],
  "current_page": 1,
  "per_page": 12,
  "total": 100,
  "last_page": 9
}
```

### GET /public/works/{slug}
Get single artwork details

**Response:**
```json
{
  "id": 1,
  "artist_id": 1,
  "title": "Starry Night",
  "description": "Famous painting...",
  "year_created": "1889",
  "medium": "Oil on canvas",
  "dimensions": {
    "width": "73.7 cm",
    "height": "92.1 cm"
  },
  "price": 1000000.00,
  "is_for_sale": false,
  "is_featured": true,
  "slug": "starry-night",
  "status": "published",
  "tags": ["impressionism", "night", "stars"],
  "like_count": 150,
  "view_count": 1000,
  "cover_image_url": "http://localhost:8001/storage/1/starry-night.jpg",
  "cover_image_thumb_url": "http://localhost:8001/storage/1/conversions/starry-night-thumb.jpg",
  "artwork_images": [
    {
      "id": 1,
      "url": "http://localhost:8001/storage/1/starry-night-detail1.jpg",
      "thumb_url": "http://localhost:8001/storage/1/conversions/starry-night-detail1-thumb.jpg"
    }
  ],
  "artist": {
    "id": 1,
    "artist_name": "Vincent van Gogh",
    "slug": "vincent-van-gogh",
    "avatar_thumb_url": "http://localhost:8001/storage/1/conversions/avatar-thumb.jpg"
  },
  "created_at": "2025-01-01T12:00:00.000000Z",
  "updated_at": "2025-01-01T12:00:00.000000Z"
}
```

### POST /public/works/{slug}/like
Like/unlike an artwork

**Response:**
```json
{
  "success": true,
  "liked": true,
  "like_count": 151
}
```

### GET /public/tags
Get list of artwork tags

**Response:**
```json
{
  "tags": [
    "impressionism",
    "abstract",
    "portrait",
    "landscape",
    "modern"
  ]
}
```

### GET /public/products
Get list of products

**Query Parameters:**
- `search` (string): Search term
- `status` (string): Filter by status
- `in_stock` (boolean): Filter by stock status
- `min_price` (number): Minimum price filter
- `max_price` (number): Maximum price filter
- `on_sale` (boolean): Filter by sale status
- `custom_dimension` (boolean): Filter by custom dimension
- `sort_by` (string): Sort field (default: created_at)
- `sort_direction` (string): Sort direction (asc/desc, default: desc)
- `per_page` (integer): Items per page (default: 15)
- `page` (integer): Page number

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "artist_id": 2,
      "main_title": "Beautiful Art Panel",
      "sub_title": "Limited Edition Print",
      "description": "High-quality art panel...",
      "price": 199.99,
      "discount_price": 149.99,
      "final_price": 149.99,
      "is_on_sale": true,
      "discount_percentage": 25,
      "product_details": "Detailed product information...",
      "in_stock": true,
      "is_custom_dimension": false,
      "slug": "beautiful-art-panel",
      "status": "published",
      "dimensions": {
        "width": "60cm",
        "height": "80cm",
        "depth": "2cm",
        "weight": "2kg"
      },
      "like_count": 45,
      "view_count": 200,
      "cover_photo_url": "http://localhost:8001/storage/100/product.jpg",
      "cover_photo_thumb_url": "http://localhost:8001/storage/100/conversions/product-thumb.jpg",
      "cover_photo_preview_url": "http://localhost:8001/storage/100/conversions/product-preview.jpg",
      "artist": {
        "id": 2,
        "artist_name": "Modern Artist",
        "slug": "modern-artist"
      },
      "created_at": "2025-01-01T12:00:00.000000Z",
      "updated_at": "2025-01-01T12:00:00.000000Z"
    }
  ],
  "current_page": 1,
  "per_page": 15,
  "total": 50,
  "last_page": 4
}
```

### GET /public/products/{slug}
Get single product details

**Response:**
```json
{
  "id": 1,
  "artist_id": 2,
  "main_title": "Beautiful Art Panel",
  "sub_title": "Limited Edition Print",
  "description": "High-quality art panel...",
  "price": 199.99,
  "discount_price": 149.99,
  "final_price": 149.99,
  "is_on_sale": true,
  "discount_percentage": 25,
  "product_details": "Detailed product information...",
  "in_stock": true,
  "is_available": true,
  "is_custom_dimension": false,
  "slug": "beautiful-art-panel",
  "status": "published",
  "dimensions": {
    "width": "60cm",
    "height": "80cm",
    "depth": "2cm",
    "weight": "2kg"
  },
  "like_count": 45,
  "view_count": 200,
  "cover_photo_url": "http://localhost:8001/storage/100/product.jpg",
  "cover_photo_thumb_url": "http://localhost:8001/storage/100/conversions/product-thumb.jpg",
  "cover_photo_preview_url": "http://localhost:8001/storage/100/conversions/product-preview.jpg",
  "product_images": [
    {
      "id": 1,
      "url": "http://localhost:8001/storage/100/product-detail1.jpg",
      "thumb_url": "http://localhost:8001/storage/100/conversions/product-detail1-thumb.jpg",
      "preview_url": "http://localhost:8001/storage/100/conversions/product-detail1-preview.jpg"
    }
  ],
  "artist": {
    "id": 2,
    "artist_name": "Modern Artist",
    "slug": "modern-artist",
    "avatar_thumb_url": "http://localhost:8001/storage/2/conversions/avatar-thumb.jpg"
  },
  "created_at": "2025-01-01T12:00:00.000000Z",
  "updated_at": "2025-01-01T12:00:00.000000Z"
}
```

### POST /public/products/{slug}/like
Like/unlike a product

**Response:**
```json
{
  "success": true,
  "liked": true,
  "like_count": 46
}
```

### GET /public/products-artists
Get list of artists who have products

**Response:**
```json
{
  "artists": [
    {
      "id": 2,
      "artist_name": "Modern Artist",
      "slug": "modern-artist",
      "products_count": 5
    }
  ]
}
```

### GET /public/art-panel-galleries
Get list of art panel galleries

**Query Parameters:**
- `search` (string): Search term
- `period` (string): Filter by period (upcoming, current, past)
- `sort_by` (string): Sort field (default: created_at)
- `sort_direction` (string): Sort direction (asc/desc, default: desc)
- `per_page` (integer): Items per page (default: 8)
- `page` (integer): Page number

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "main_title": "Contemporary Art Exhibition",
      "sub_title": "Modern Masterpieces",
      "overview": "A showcase of contemporary art...",
      "location": "New York Gallery",
      "start_date": "2025-02-01",
      "end_date": "2025-03-01",
      "date_period": "Feb 1 - Mar 1, 2025",
      "slug": "contemporary-art-exhibition",
      "status": "published",
      "participating_artists_count": 15,
      "cover_image_url": "http://localhost:8001/storage/gallery/cover.jpg",
      "cover_image_thumb_url": "http://localhost:8001/storage/gallery/conversions/cover-thumb.jpg",
      "created_at": "2025-01-01T12:00:00.000000Z",
      "updated_at": "2025-01-01T12:00:00.000000Z"
    }
  ],
  "current_page": 1,
  "per_page": 8,
  "total": 5,
  "last_page": 1
}
```

### GET /public/art-panel-galleries/{slug}
Get single gallery details

**Response:**
```json
{
  "id": 1,
  "main_title": "Contemporary Art Exhibition",
  "sub_title": "Modern Masterpieces",
  "overview": "A showcase of contemporary art...",
  "location": "New York Gallery",
  "start_date": "2025-02-01",
  "end_date": "2025-03-01",
  "date_period": "Feb 1 - Mar 1, 2025",
  "slug": "contemporary-art-exhibition",
  "status": "published",
  "participating_artists_count": 15,
  "cover_image_url": "http://localhost:8001/storage/gallery/cover.jpg",
  "cover_image_thumb_url": "http://localhost:8001/storage/gallery/conversions/cover-thumb.jpg",
  "gallery_images": [
    {
      "id": 1,
      "url": "http://localhost:8001/storage/gallery/image1.jpg",
      "thumb_url": "http://localhost:8001/storage/gallery/conversions/image1-thumb.jpg"
    }
  ],
  "participating_artists": [
    {
      "id": 1,
      "artist_name": "Vincent van Gogh",
      "slug": "vincent-van-gogh",
      "avatar_thumb_url": "http://localhost:8001/storage/1/conversions/avatar-thumb.jpg"
    }
  ],
  "created_at": "2025-01-01T12:00:00.000000Z",
  "updated_at": "2025-01-01T12:00:00.000000Z"
}
```

### GET /public/galleries-artists
Get list of artists participating in galleries

**Response:**
```json
{
  "artists": [
    {
      "id": 1,
      "artist_name": "Vincent van Gogh",
      "slug": "vincent-van-gogh",
      "galleries_count": 3
    }
  ]
}
```

### GET /public/news
Get list of news articles

**Query Parameters:**
- `search` (string): Search term
- `per_page` (integer): Items per page (default: 8)
- `page` (integer): Page number

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "main_title": "Art World News",
      "sub_title": "Latest Updates",
      "description": "Recent developments in the art world...",
      "author_name": "Art Journalist",
      "cover_photo": "news/covers/article1.jpg",
      "author_photo": "news/authors/journalist.jpg",
      "created_at": "2025-01-01T12:00:00.000000Z",
      "updated_at": "2025-01-01T12:00:00.000000Z"
    }
  ],
  "current_page": 1,
  "per_page": 8,
  "total": 20,
  "last_page": 3
}
```

### GET /public/news/{id}
Get single news article

**Response:**
```json
{
  "id": 1,
  "main_title": "Art World News",
  "sub_title": "Latest Updates",
  "description": "Recent developments in the art world...",
  "author_name": "Art Journalist",
  "cover_photo": "news/covers/article1.jpg",
  "author_photo": "news/authors/journalist.jpg",
  "created_at": "2025-01-01T12:00:00.000000Z",
  "updated_at": "2025-01-01T12:00:00.000000Z"
}
```

---

## Admin Content Management

**Note:** All admin routes require authentication with Bearer token in the Authorization header.

### Admins Management

#### GET /admins
Get list of admins

**Query Parameters:**
- `search` (string): Search term
- `per_page` (integer): Items per page (default: 15)
- `page` (integer): Page number

#### POST /admins
Create new admin

**Parameters:**
```json
{
  "name": "Admin Name",
  "email": "admin@example.com",
  "password": "password123",
  "role": "admin",
  "is_active": true
}
```

#### GET /admins/{id}
Get single admin

#### PUT /admins/{id}
Update admin

#### DELETE /admins/{id}
Delete admin

### Users Management

#### GET /users
Get list of users

#### POST /users
Create new user

#### GET /users/{id}
Get single user

#### PUT /users/{id}
Update user

#### DELETE /users/{id}
Delete user

### Artists Management

#### GET /artists
Get list of artists (admin view)

#### POST /artists
Create new artist

**Parameters (multipart/form-data):**
```json
{
  "artist_name": "Artist Name",
  "bio": "Artist biography...",
  "link": "https://artist-website.com",
  "slug": "artist-name",
  "is_active": true,
  "social_links": {
    "instagram": "@artist",
    "facebook": "artist"
  },
  "contact_email": "artist@example.com",
  "phone": "+1234567890",
  "specialties": "Oil painting, Portraits",
  "commission_rate": 15.00,
  "avatar": "file_upload",
  "gallery_images": ["file_upload1", "file_upload2"]
}
```

#### GET /artists/{slug}
Get single artist (admin view)

#### PUT /artists/{slug}
Update artist

#### DELETE /artists/{slug}
Delete artist

#### GET /artists/{slug}/works
Get artist's works (admin view)

### Artist Works Management

#### GET /artist-works
Get list of artworks (admin view)

#### POST /artist-works
Create new artwork

#### GET /artist-works/{slug}
Get single artwork (admin view)

#### PUT /artist-works/{slug}
Update artwork

#### DELETE /artist-works/{slug}
Delete artwork

#### POST /artist-works/{slug}/toggle-featured
Toggle featured status

#### POST /artist-works/{slug}/toggle-for-sale
Toggle for sale status

#### POST /artist-works/{slug}/like
Like/unlike artwork

### Products Management

#### GET /products
Get list of products (admin view)

#### POST /products
Create new product

**Parameters (multipart/form-data):**
```json
{
  "artist_id": 1,
  "main_title": "Product Title",
  "sub_title": "Product Subtitle",
  "description": "Product description...",
  "price": 199.99,
  "discount_price": 149.99,
  "product_details": "Detailed information...",
  "in_stock": true,
  "is_custom_dimension": false,
  "slug": "product-title",
  "status": "published",
  "dimensions": {
    "width": "60cm",
    "height": "80cm",
    "depth": "2cm",
    "weight": "2kg"
  },
  "cover_photo": "file_upload",
  "product_images": ["file_upload1", "file_upload2"]
}
```

#### GET /products/{slug}
Get single product (admin view)

#### PUT /products/{slug}
Update product

#### DELETE /products/{slug}
Delete product

#### POST /products/{slug}/toggle-stock
Toggle stock status

#### POST /products/{slug}/like
Like/unlike product

#### GET /products-artists
Get artists with products

### Art Panel Galleries Management

#### GET /art-panel-galleries
Get list of galleries (admin view)

#### POST /art-panel-galleries
Create new gallery

#### GET /art-panel-galleries/{slug}
Get single gallery (admin view)

#### PUT /art-panel-galleries/{slug}
Update gallery

#### DELETE /art-panel-galleries/{slug}
Delete gallery

#### GET /galleries-artists
Get artists for galleries

### News Management

#### GET /news
Get list of news (admin view)

#### POST /news
Create new news article

**Parameters (multipart/form-data):**
```json
{
  "main_title": "News Title",
  "sub_title": "News Subtitle",
  "description": "News content...",
  "author_name": "Author Name",
  "cover_photo": "file_upload",
  "author_photo": "file_upload"
}
```

#### GET /news/{id}
Get single news article (admin view)

#### PUT /news/{id}
Update news article

#### DELETE /news/{id}
Delete news article

---

## Error Responses

### Validation Error (422)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": ["The email field is required."],
    "password": ["The password field is required."]
  }
}
```

### Authentication Error (401)
```json
{
  "success": false,
  "message": "User not authenticated"
}
```

### Authorization Error (403)
```json
{
  "success": false,
  "message": "Unauthorized access"
}
```

### Not Found Error (404)
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Detailed error message"
}
```

---

## Notes

1. **File Uploads**: Use `multipart/form-data` content type for endpoints that accept file uploads.
2. **Authentication**: Include session cookies for user authentication or Bearer token for admin authentication.
3. **Pagination**: Most list endpoints support pagination with `page` and `per_page` parameters.
4. **Search**: Many endpoints support search functionality via the `search` parameter.
5. **Filtering**: List endpoints often support various filtering options as query parameters.
6. **Sorting**: Use `sort_by` and `sort_direction` parameters for custom sorting.
7. **Image URLs**: All image URLs are fully qualified URLs pointing to the storage directory.
8. **Slugs**: Many resources use slugs instead of IDs in URLs for better SEO and readability.

---

## Base URL for Images
All images are served from:
```
http://localhost:8001/storage/
```

The storage symlink must be created using:
```bash
php artisan storage:link
```
