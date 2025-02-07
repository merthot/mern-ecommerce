import { Link } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';

const Pagination = ({ pages, page, keyword = '' }) => {
    if (pages <= 1) return null;

    return (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
                <Link
                    to={
                        page > 1
                            ? keyword
                                ? `/search/${keyword}/page/${page - 1}`
                                : `/page/${page - 1}`
                            : '#'
                    }
                    className={`relative inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${page <= 1
                        ? 'pointer-events-none bg-gray-100 text-gray-400'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                >
                    Önceki
                </Link>
                <Link
                    to={
                        page < pages
                            ? keyword
                                ? `/search/${keyword}/page/${page + 1}`
                                : `/page/${page + 1}`
                            : '#'
                    }
                    className={`relative ml-3 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${page >= pages
                        ? 'pointer-events-none bg-gray-100 text-gray-400'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                >
                    Sonraki
                </Link>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-700">
                        Toplam <span className="font-medium">{pages}</span> sayfa
                    </p>
                </div>
                <div>
                    <nav
                        className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                        aria-label="Pagination"
                    >
                        <Link
                            to={
                                page > 1
                                    ? keyword
                                        ? `/search/${keyword}/page/${page - 1}`
                                        : `/page/${page - 1}`
                                    : '#'
                            }
                            className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${page <= 1 && 'pointer-events-none'
                                }`}
                        >
                            <span className="sr-only">Önceki</span>
                            <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                        </Link>

                        {[...Array(pages).keys()].map((x) => (
                            <Link
                                key={x + 1}
                                to={
                                    keyword
                                        ? `/search/${keyword}/page/${x + 1}`
                                        : `/page/${x + 1}`
                                }
                                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${page === x + 1
                                    ? 'z-10 bg-indigo-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                                    : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                                    }`}
                            >
                                {x + 1}
                            </Link>
                        ))}

                        <Link
                            to={
                                page < pages
                                    ? keyword
                                        ? `/search/${keyword}/page/${page + 1}`
                                        : `/page/${page + 1}`
                                    : '#'
                            }
                            className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${page >= pages && 'pointer-events-none'
                                }`}
                        >
                            <span className="sr-only">Sonraki</span>
                            <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                        </Link>
                    </nav>
                </div>
            </div>
        </div>
    );
};

export default Pagination; 