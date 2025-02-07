import { Link } from 'react-router-dom';

const steps = [
    { id: 'step1', name: 'Giriş', href: '/login' },
    { id: 'step2', name: 'Teslimat', href: '/shipping' },
    { id: 'step3', name: 'Ödeme', href: '/payment' },
    { id: 'step4', name: 'Sipariş', href: '/placeorder' },
];

const CheckoutSteps = ({ step1, step2, step3, step4 }) => {
    return (
        <nav aria-label="Progress">
            <ol className="divide-y divide-gray-300 rounded-md border border-gray-300 md:flex md:divide-y-0">
                {steps.map((step, stepIdx) => {
                    let status = 'upcoming';
                    let linkEnabled = false;

                    if (
                        (step.id === 'step1' && step1) ||
                        (step.id === 'step2' && step2) ||
                        (step.id === 'step3' && step3) ||
                        (step.id === 'step4' && step4)
                    ) {
                        status = 'complete';
                        linkEnabled = true;
                    } else if (
                        (step.id === 'step1' && !step1) ||
                        (step.id === 'step2' && !step2) ||
                        (step.id === 'step3' && !step3) ||
                        (step.id === 'step4' && !step4)
                    ) {
                        status = 'current';
                    }

                    return (
                        <li key={step.name} className="relative md:flex md:flex-1">
                            {status === 'complete' ? (
                                <Link
                                    to={step.href}
                                    className="group flex w-full items-center"
                                >
                                    <span className="flex items-center px-6 py-4 text-sm font-medium">
                                        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 group-hover:bg-indigo-800">
                                            <svg
                                                className="h-6 w-6 text-white"
                                                viewBox="0 0 24 24"
                                                fill="currentColor"
                                                aria-hidden="true"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </span>
                                        <span className="ml-4 text-sm font-medium text-gray-900">
                                            {step.name}
                                        </span>
                                    </span>
                                </Link>
                            ) : status === 'current' ? (
                                <Link
                                    to={linkEnabled ? step.href : '#'}
                                    className="flex items-center px-6 py-4 text-sm font-medium"
                                    aria-current="step"
                                >
                                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-indigo-600">
                                        <span className="text-indigo-600">{stepIdx + 1}</span>
                                    </span>
                                    <span className="ml-4 text-sm font-medium text-indigo-600">
                                        {step.name}
                                    </span>
                                </Link>
                            ) : (
                                <Link
                                    to={linkEnabled ? step.href : '#'}
                                    className="group flex items-center"
                                >
                                    <span className="flex items-center px-6 py-4 text-sm font-medium">
                                        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-gray-300 group-hover:border-gray-400">
                                            <span className="text-gray-500 group-hover:text-gray-900">
                                                {stepIdx + 1}
                                            </span>
                                        </span>
                                        <span className="ml-4 text-sm font-medium text-gray-500 group-hover:text-gray-900">
                                            {step.name}
                                        </span>
                                    </span>
                                </Link>
                            )}

                            {stepIdx !== steps.length - 1 ? (
                                <>
                                    <div
                                        className="absolute right-0 top-0 hidden h-full w-5 md:block"
                                        aria-hidden="true"
                                    >
                                        <svg
                                            className="h-full w-full text-gray-300"
                                            viewBox="0 0 22 80"
                                            fill="none"
                                            preserveAspectRatio="none"
                                        >
                                            <path
                                                d="M0 -2L20 40L0 82"
                                                vectorEffect="non-scaling-stroke"
                                                stroke="currentcolor"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </div>
                                </>
                            ) : null}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default CheckoutSteps; 