import React from 'react'

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    <div className="px-6 py-8">
                        <div className="flex items-center mb-6">
                            <button 
                                onClick={() => window.history.back()}
                                className="mr-4 text-gray-600 hover:text-gray-800 transition-colors"
                                title="Go back"
                            >
                                <i className="fa-solid fa-arrow-left text-xl"></i>
                            </button>
                            <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
                        </div>
                        <p className="text-sm text-gray-600 mb-8">
                            <strong>Effective Date:</strong> {new Date().toLocaleDateString()}<br />
                            <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
                        </p>

                        <div className="prose prose-gray max-w-none">
                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
                                <p className="mb-4">
                                    AudioTextly ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our speech-to-text transcription service.
                                </p>
                                <p className="mb-4">
                                    By using our Service, you agree to the collection and use of information in accordance with this Privacy Policy.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
                                
                                <h3 className="text-lg font-medium text-gray-800 mb-3">2.1 Personal Information</h3>
                                <p className="mb-4">When you create an account, we collect:</p>
                                <ul className="list-disc pl-6 mb-4">
                                    <li>Full name</li>
                                    <li>Email address</li>
                                    <li>Organization name and type</li>
                                    <li>Account preferences and settings</li>
                                </ul>

                                <h3 className="text-lg font-medium text-gray-800 mb-3">2.2 Content Information</h3>
                                <p className="mb-4">When you use our transcription service, we process:</p>
                                <ul className="list-disc pl-6 mb-4">
                                    <li>Audio and video files you upload</li>
                                    <li>Transcribed text generated from your content</li>
                                    <li>Custom vocabulary terms you provide</li>
                                    <li>File metadata (size, duration, format)</li>
                                </ul>

                                <h3 className="text-lg font-medium text-gray-800 mb-3">2.3 Usage Information</h3>
                                <p className="mb-4">We automatically collect certain information about your use of the Service:</p>
                                <ul className="list-disc pl-6 mb-4">
                                    <li>IP address and device information</li>
                                    <li>Browser type and version</li>
                                    <li>Pages visited and features used</li>
                                    <li>Time and date of access</li>
                                    <li>Transcription history and usage statistics</li>
                                </ul>

                                <h3 className="text-lg font-medium text-gray-800 mb-3">2.4 Cookies and Tracking Technologies</h3>
                                <p className="mb-4">We use cookies and similar technologies to:</p>
                                <ul className="list-disc pl-6 mb-4">
                                    <li>Maintain your login session</li>
                                    <li>Remember your preferences</li>
                                    <li>Analyze usage patterns</li>
                                    <li>Improve service performance</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
                                <p className="mb-4">We use the collected information for the following purposes:</p>
                                
                                <h3 className="text-lg font-medium text-gray-800 mb-3">3.1 Service Provision</h3>
                                <ul className="list-disc pl-6 mb-4">
                                    <li>Process your audio/video files for transcription</li>
                                    <li>Generate accurate text transcripts</li>
                                    <li>Provide various export formats</li>
                                    <li>Maintain your account and preferences</li>
                                </ul>

                                <h3 className="text-lg font-medium text-gray-800 mb-3">3.2 Service Improvement</h3>
                                <ul className="list-disc pl-6 mb-4">
                                    <li>Analyze usage patterns to improve our service</li>
                                    <li>Develop new features and functionality</li>
                                    <li>Troubleshoot technical issues</li>
                                    <li>Monitor service performance</li>
                                </ul>

                                <h3 className="text-lg font-medium text-gray-800 mb-3">3.3 Communication</h3>
                                <ul className="list-disc pl-6 mb-4">
                                    <li>Send service-related notifications</li>
                                    <li>Provide customer support</li>
                                    <li>Send important updates about our service</li>
                                    <li>Respond to your inquiries</li>
                                </ul>

                                <h3 className="text-lg font-medium text-gray-800 mb-3">3.4 Legal and Security</h3>
                                <ul className="list-disc pl-6 mb-4">
                                    <li>Comply with legal obligations</li>
                                    <li>Enforce our Terms of Service</li>
                                    <li>Protect against fraud and abuse</li>
                                    <li>Ensure platform security</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Third-Party Services</h2>
                                
                                <h3 className="text-lg font-medium text-gray-800 mb-3">4.1 Rev AI Integration</h3>
                                <p className="mb-4">
                                    Our transcription service is powered by Rev AI. When you use our service:
                                </p>
                                <ul className="list-disc pl-6 mb-4">
                                    <li>Your audio/video content is securely transmitted to Rev AI for processing</li>
                                    <li>Rev AI processes your content according to their privacy policy</li>
                                    <li>Transcribed text is returned to our service and stored temporarily</li>
                                    <li>Rev AI may retain your content for quality assurance and service improvement</li>
                                </ul>
                                <p className="mb-4">
                                    Please review Rev AI's privacy policy at <a href="https://www.rev.ai/privacy" className="text-blue-600 hover:text-blue-500 underline">https://www.rev.ai/privacy</a> for details on their data handling practices.
                                </p>

                                <h3 className="text-lg font-medium text-gray-800 mb-3">4.2 Firebase Authentication</h3>
                                <p className="mb-4">
                                    We use Google Firebase for user authentication and data storage. Firebase's privacy practices are governed by Google's privacy policy.
                                </p>

                                <h3 className="text-lg font-medium text-gray-800 mb-3">4.3 Analytics Services</h3>
                                <p className="mb-4">
                                    We may use analytics services to understand how our service is used and to improve user experience. These services may collect anonymized usage data.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
                                <p className="mb-4">We implement appropriate security measures to protect your information:</p>
                                <ul className="list-disc pl-6 mb-4">
                                    <li><strong>Encryption:</strong> Data is encrypted in transit and at rest</li>
                                    <li><strong>Access Control:</strong> Limited access to personal data on a need-to-know basis</li>
                                    <li><strong>Regular Audits:</strong> Security practices are regularly reviewed and updated</li>
                                    <li><strong>Secure Infrastructure:</strong> Use of industry-standard cloud infrastructure</li>
                                    <li><strong>Data Minimization:</strong> We collect only necessary information</li>
                                </ul>
                                <p className="mb-4">
                                    However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your personal information, we cannot guarantee absolute security.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Data Retention</h2>
                                <p className="mb-4">We retain your information for different periods depending on the type of data:</p>
                                <ul className="list-disc pl-6 mb-4">
                                    <li><strong>Account Information:</strong> Retained until account deletion</li>
                                    <li><strong>Audio/Video Files:</strong> Automatically deleted after 30 days</li>
                                    <li><strong>Transcripts:</strong> Retained until you delete them or close your account</li>
                                    <li><strong>Usage Data:</strong> Retained for up to 2 years for analytics purposes</li>
                                    <li><strong>Support Communications:</strong> Retained for 3 years</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Your Rights and Choices</h2>
                                <p className="mb-4">You have the following rights regarding your personal information:</p>
                                
                                <h3 className="text-lg font-medium text-gray-800 mb-3">7.1 Access and Portability</h3>
                                <ul className="list-disc pl-6 mb-4">
                                    <li>Request a copy of your personal data</li>
                                    <li>Export your transcripts and account data</li>
                                    <li>View your account information and settings</li>
                                </ul>

                                <h3 className="text-lg font-medium text-gray-800 mb-3">7.2 Correction and Updates</h3>
                                <ul className="list-disc pl-6 mb-4">
                                    <li>Update your account information</li>
                                    <li>Correct inaccurate personal data</li>
                                    <li>Modify your communication preferences</li>
                                </ul>

                                <h3 className="text-lg font-medium text-gray-800 mb-3">7.3 Deletion</h3>
                                <ul className="list-disc pl-6 mb-4">
                                    <li>Delete specific transcripts or files</li>
                                    <li>Request deletion of your personal data</li>
                                    <li>Close your account permanently</li>
                                </ul>

                                <h3 className="text-lg font-medium text-gray-800 mb-3">7.4 Opt-Out</h3>
                                <ul className="list-disc pl-6 mb-4">
                                    <li>Unsubscribe from marketing communications</li>
                                    <li>Disable non-essential cookies</li>
                                    <li>Opt out of data analytics (where technically feasible)</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">8. International Data Transfers</h2>
                                <p className="mb-4">
                                    Your information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Children's Privacy</h2>
                                <p className="mb-4">
                                    Our Service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided personal information, please contact us to have it removed.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">10. California Privacy Rights (CCPA)</h2>
                                <p className="mb-4">
                                    If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA):
                                </p>
                                <ul className="list-disc pl-6 mb-4">
                                    <li>Right to know what personal information is collected</li>
                                    <li>Right to delete personal information</li>
                                    <li>Right to opt-out of the sale of personal information</li>
                                    <li>Right to non-discrimination for exercising CCPA rights</li>
                                </ul>
                                <p className="mb-4">
                                    Note: We do not sell personal information to third parties.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">11. European Privacy Rights (GDPR)</h2>
                                <p className="mb-4">
                                    If you are in the European Economic Area (EEA), you have rights under the General Data Protection Regulation (GDPR), including:
                                </p>
                                <ul className="list-disc pl-6 mb-4">
                                    <li>Right of access to your personal data</li>
                                    <li>Right to rectification of inaccurate data</li>
                                    <li>Right to erasure ("right to be forgotten")</li>
                                    <li>Right to restrict processing</li>
                                    <li>Right to data portability</li>
                                    <li>Right to object to processing</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Changes to This Privacy Policy</h2>
                                <p className="mb-4">
                                    We may update this Privacy Policy from time to time. We will notify you of any material changes by:
                                </p>
                                <ul className="list-disc pl-6 mb-4">
                                    <li>Posting the updated policy on our website</li>
                                    <li>Sending email notification to registered users</li>
                                    <li>Displaying a prominent notice in the Service</li>
                                </ul>
                                <p className="mb-4">
                                    Your continued use of the Service after such modifications constitutes acceptance of the updated Privacy Policy.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">13. Contact Us</h2>
                                <p className="mb-4">
                                    If you have any questions about this Privacy Policy or our data practices, please contact us:
                                </p>
                                <div className="bg-gray-50 p-4 rounded-md">
                                    <p><strong>Email:</strong> <a href="mailto:privacy@audiotextly.com" className="text-blue-600 hover:text-blue-800 underline">privacy@audiotextly.com</a></p>
                                    <p><strong>Data Protection Officer:</strong> <a href="mailto:dpo@audiotextly.com" className="text-blue-600 hover:text-blue-800 underline">dpo@audiotextly.com</a></p>
                                    <p><strong>Address:</strong> [Your Business Address]</p>
                                    <p><strong>Phone:</strong> [Your Contact Number]</p>
                                </div>
                            </section>

                            <div className="mt-12 p-4 bg-blue-50 border border-blue-200 rounded-md">
                                <p className="text-sm text-blue-800">
                                    <strong>Note:</strong> This Privacy Policy document is a comprehensive template and should be reviewed by legal counsel before implementation. Specific business details, jurisdictions, and contact information should be updated to reflect your actual business practices and legal requirements.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
