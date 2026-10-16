// Load MENU items from SQLite
export const getAllItems = async (db) => {
  return await db.getAllAsync("SELECT * FROM menu");
};

//load item by id
export const getMenuItemById = async (db, id) => {
  const items = await db.getAllAsync("SELECT * FROM menu WHERE id = ?", [id]);
  return items.length > 0 ? items[0] : null;
};  

export const insertMenuIntoSQLite = async (db, menuItems = []) => {
  if (!db) throw new Error('db is required');
  const items = Array.isArray(menuItems) ? menuItems : [menuItems];
  await ensureMenuTable(db);

  for (const item of items) {
    const vals = [
      item.id || null,
      item.name || '',
      item.description || '',
      typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0,
      item.category || '',
      item.image || '',
      typeof item.rating === 'number' ? item.rating : null,
      item.prepareTime || '',
      item.available !== undefined ? (item.available ? 1 : 0) : 1,
      item.tags ? JSON.stringify(item.tags) : '',
    ];
    // eslint-disable-next-line no-await-in-loop
    await db.runAsync(
      `INSERT OR REPLACE INTO menu (id, name, description, price, category, image, rating, prepareTime, available, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      , vals
    );
  }
};



export const ensureMenuTable = async (db) => {
  await db.runAsync(
    `CREATE TABLE IF NOT EXISTS menu (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      description TEXT,
      price REAL,
      category TEXT,
      image TEXT,
      rating REAL,
      prepareTime TEXT,
      available INTEGER DEFAULT 1,
      tags TEXT
    )`
  );
};



//empty the menu table
export const clearMenuTable = async (db) => {
  await db.runAsync(`DELETE FROM menu`);
};

// Drop and recreate the menu table with updated schema (for syncing database structure)
export const resetMenuTable = async (db) => {
  await db.runAsync(`DROP TABLE IF EXISTS menu`);
  await ensureMenuTable(db);
};

// Sync database: clear data and reload from remote
export const syncMenuDatabase = async (db, remoteUrl) => {
  try {
    // Drop and recreate table to ensure schema is up to date
    await resetMenuTable(db);
    
    // Fetch remote data
    const res = await fetch(remoteUrl);
    const json = await res.json();
    const menu = json?.menu || [];
    
    // Insert all items
    await insertMenuIntoSQLite(db, menu);
    
    return { success: true, count: menu.length };
  } catch (error) {
    console.error('Sync error:', error);
    return { success: false, error: error.message };
  }
};


//filter items by category
export const getItemsByCategory = async (db, category) => {
  return await db.getAllAsync("SELECT * FROM menu WHERE category = ?", [category]);//nb:it doesnt works like and statement 
};



// search items by text: matches name OR category
export const searchItemsByText = async (db, query) => {
  const likeQuery = `%${query}%`;
  return await db.getAllAsync(
    "SELECT * FROM menu WHERE name LIKE ? OR category LIKE ?",
    [likeQuery, likeQuery]
  );
};

export const insertMenuIfNotExists = async (db, menuItems = []) => {
  if (!db) throw new Error('db is required');
  const items = Array.isArray(menuItems) ? menuItems : [menuItems];
  await ensureMenuTable(db);
  for (const item of items) { 
    const existing = await getMenuItemById(db, item.id);
    if (!existing) {
      const vals = [
        item.id || null,
        item.name || '',
        item.description || '',
        typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0,
        item.category || '',
        item.image || '',
        typeof item.rating === 'number' ? item.rating : null,
        item.prepareTime || '',
        item.available !== undefined ? (item.available ? 1 : 0) : 1,
        item.tags ? JSON.stringify(item.tags) : '',
      ];
      // eslint-disable-next-line no-await-in-loop
      await db.runAsync(  
        `INSERT INTO menu (id, name, description, price, category, image,rating,prepareTime,available,tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        , vals
      );
    }
  }
}
