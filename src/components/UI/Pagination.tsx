import React from 'react';
import './Pagination.css';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  totalItems: number;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  totalItems,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100]
}) => {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) {
    return (
      <div className="pagination-container">
        <div className="pagination-info">
          Showing {totalItems} item{totalItems !== 1 ? 's' : ''}
        </div>
        <div className="pagination-controls">
          <select 
            value={pageSize} 
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="page-size-select"
          >
            {pageSizeOptions.map(size => (
              <option key={size} value={size}>{size} per page</option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        Showing {startItem}-{endItem} of {totalItems} item{totalItems !== 1 ? 's' : ''}
      </div>
      
      <div className="pagination-controls">
        <div className="pagination-buttons">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-btn"
            aria-label="Previous page"
          >
            ‹
          </button>

          {getVisiblePages().map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="pagination-dots">...</span>
              ) : (
                <button
                  onClick={() => onPageChange(page as number)}
                  className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                  aria-label={`Go to page ${page}`}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-btn"
            aria-label="Next page"
          >
            ›
          </button>
        </div>

        <select 
          value={pageSize} 
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="page-size-select"
        >
          {pageSizeOptions.map(size => (
            <option key={size} value={size}>{size} per page</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default Pagination;
