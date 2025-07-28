// src/components/Favorites.tsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan } from '@fortawesome/free-solid-svg-icons';

export interface FavoriteItem {
  _id: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
}

interface FavoritesProps {
  favoritesList: FavoriteItem[];
  onDeleteFavorite: (city: string, state: string) => void;
  onFavoriteSearch: (latitude: number, longitude: number, city: string, state: string) => void;
}

const Favorites: React.FC<FavoritesProps> = ({ favoritesList, onDeleteFavorite, onFavoriteSearch }) => {
  return (
    <div className="container mt-5">
      {favoritesList.length === 0 ? (
        <div className="alert alert-warning" role="alert">
          Sorry, no records found.
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th className="text-center">#</th>
                <th className="text-center">City</th>
                <th className="text-center">State</th>
                <th className="text-center"></th>
              </tr>
            </thead>
            <tbody>
              {favoritesList.map((item, index) => (
                <tr key={item._id}>
                  <td className="text-center">{index + 1}</td>
                  <td className="text-center">
                    <button
                      onClick={() => onFavoriteSearch(item.latitude, item.longitude, item.city, item.state)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'blue',
                        textDecoration: 'underline',
                        cursor: 'pointer',
                      }}
                    >
                      {item.city}
                    </button>
                  </td>
                  <td className="text-center">
                    <button
                      onClick={() => onFavoriteSearch(item.latitude, item.longitude, item.city, item.state)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'blue',
                        textDecoration: 'underline',
                        cursor: 'pointer',
                      }}
                    >
                      {item.state}
                    </button>
                  </td>
                  <td className="text-center">
                    <button
                      className="btn btn-link p-0"
                      style={{ cursor: 'pointer' }}
                      aria-label="Delete favorite"
                      onClick={() => onDeleteFavorite(item.city, item.state)}
                    >
                      <FontAwesomeIcon icon={faTrashCan} color="black" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Favorites;
