import { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext(null);

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(i => i._id === action.payload._id);
      if (existing) {
        return {
          ...state,
          items: state.items.map(i =>
            i._id === action.payload._id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return { ...state, items: [...state.items, { ...action.payload, quantity: 1 }] };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i._id !== action.payload) };
    case 'UPDATE_QUANTITY': {
      if (action.payload.qty <= 0) {
        return { ...state, items: state.items.filter(i => i._id !== action.payload.id) };
      }
      return {
        ...state,
        items: state.items.map(i =>
          i._id === action.payload.id ? { ...i, quantity: action.payload.qty } : i
        ),
      };
    }
    case 'CLEAR_CART':
      return { ...state, items: [] };
    case 'SET_TABLE':
      return { ...state, tableNumber: action.payload };
    default:
      return state;
  }
};

const initialState = {
  items: [],
  tableNumber: null,
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState, () => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : initialState;
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state));
  }, [state]);

  const subtotal = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const tax = parseFloat((subtotal * 0.05).toFixed(2));
  const serviceCharge = parseFloat((subtotal * 0.02).toFixed(2));
  const grandTotal = parseFloat((subtotal + tax + serviceCharge).toFixed(2));
  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items: state.items,
      tableNumber: state.tableNumber,
      subtotal, tax, serviceCharge, grandTotal, totalItems,
      addItem: (item) => dispatch({ type: 'ADD_ITEM', payload: item }),
      removeItem: (id) => dispatch({ type: 'REMOVE_ITEM', payload: id }),
      updateQuantity: (id, qty) => dispatch({ type: 'UPDATE_QUANTITY', payload: { id, qty } }),
      clearCart: () => dispatch({ type: 'CLEAR_CART' }),
      setTable: (num) => dispatch({ type: 'SET_TABLE', payload: num }),
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
