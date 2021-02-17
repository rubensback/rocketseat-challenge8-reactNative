import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const productsList = await AsyncStorage.getItem('Products');
      if (productsList) setProducts(JSON.parse(productsList));
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      // TODO ADD A NEW ITEM TO THE CART
      const { id, quantity } = product;

      const productsList = products;

      const productAlreadyAddedIndex = products.findIndex(
        item => item.id === id,
      );

      if (productAlreadyAddedIndex >= 0) {
        const productToAdd = productsList[productAlreadyAddedIndex];
        productsList[productAlreadyAddedIndex] = {
          ...productToAdd,
          quantity: productToAdd.quantity + 1,
        };
      } else {
        productsList.push({ ...product, quantity: 1 });
      }

      await AsyncStorage.setItem('Products', JSON.stringify(productsList));
      setProducts([...productsList]);
    },
    [products],
  );

  const increment = useCallback(async id => {
    // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
    const productsList = products;

    const productAlreadyAddedIndex = products.findIndex(item => item.id === id);

    const productToAdd = productsList[productAlreadyAddedIndex];
    productsList[productAlreadyAddedIndex] = {
      ...productToAdd,
      quantity: productToAdd.quantity + 1,
    };

    await AsyncStorage.setItem('Products', JSON.stringify(productsList));
    setProducts([...productsList]);
  }, []);

  const decrement = useCallback(async id => {
    // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
    const productsList = products;

    const productAlreadyAddedIndex = products.findIndex(item => item.id === id);

    const productToAdd = productsList[productAlreadyAddedIndex];
    productsList[productAlreadyAddedIndex] = {
      ...productToAdd,
      quantity: productToAdd.quantity - 1,
    };

    await AsyncStorage.setItem('Products', JSON.stringify(productsList));
    setProducts([...productsList]);
  }, []);

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
