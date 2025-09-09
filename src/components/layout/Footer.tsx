import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-white mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-2">
                        <h3 className="text-lg font-semibold mb-4">ReachPilot</h3>
                        <p className="text-gray-300 mb-4">
                            Streamline your recruitment process with our powerful outreach platform.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-md font-semibold mb-4">Product</h4>
                        <ul className="space-y-2">
                            <li><Link href="/features" className="text-gray-300 hover:text-white">Features</Link></li>
                            <li><Link href="/pricing" className="text-gray-300 hover:text-white">Pricing</Link></li>
                            <li><Link href="/integrations" className="text-gray-300 hover:text-white">Integrations</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-md font-semibold mb-4">Support</h4>
                        <ul className="space-y-2">
                            <li><Link href="/help" className="text-gray-300 hover:text-white">Help Center</Link></li>
                            <li><Link href="/contact-us" className="text-gray-300 hover:text-white">Contact Us</Link></li>
                            <li><Link href="/privacy" className="text-gray-300 hover:text-white">Privacy</Link></li>
                            <li><Link href="/terms" className="text-gray-300 hover:text-white">Terms</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-700 mt-8 pt-8 text-center">
                    <p className="text-gray-300">&copy; 2025 ReachPilot. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}