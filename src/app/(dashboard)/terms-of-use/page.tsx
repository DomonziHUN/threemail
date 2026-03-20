"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText } from "lucide-react";

export default function TermsOfUsePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <FileText className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Terms and Conditions of Service</h1>
          <p className="text-muted-foreground">ThreeMail Financial Services Ltd. - Effective: March 20, 2026</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General Terms and Conditions</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[700px] pr-4">
            <div className="space-y-6 text-sm leading-relaxed">
              
              {/* 1. GENERAL PROVISIONS */}
              <section>
                <h3 className="text-lg font-semibold mb-3">1. GENERAL PROVISIONS AND DEFINITIONS</h3>
                
                <p className="text-muted-foreground mb-3">
                  <strong>1.1.</strong> These General Terms and Conditions (hereinafter: "Terms") govern the payment services, electronic money issuance, 
                  lending services, investment services, and all other financial and ancillary services provided by ThreeMail Financial Services Limited 
                  (registered office: Level 3, Triq Dun Karm, Birkirkara BKR 9033, Malta; company registration number: C 98765; 
                  website: www.threemail.fun; LEI: 5493007QKFXME2T8X054; hereinafter: "Service Provider" or "Company").
                </p>

                <p className="text-muted-foreground mb-3">
                  <strong>1.2.</strong> The Service Provider is a financial institution licensed and regulated by the Malta Financial Services Authority (MFSA) 
                  under license number IS/89324 and passported throughout the European Economic Area under the EU Payment Services Directive (PSD2 - Directive (EU) 2015/2366). 
                  The Company is authorized to provide payment services, issue electronic money, and offer lending services 
                  in accordance with the Payment Services Act (Cap. 590), the Financial Institutions Act (Cap. 376), and the Electronic Money Regulations (S.L. 371.09) of Malta. 
                  The Service Provider is a member of the Depositor Compensation Scheme (DCS) administered by the Malta Depositor Compensation Scheme Committee, 
                  which protects eligible customer deposits up to €100,000 per depositor per institution in accordance with the Depositor Compensation Scheme Regulations 
                  (Directive 2014/49/EU).
                </p>

                <p className="text-muted-foreground mb-3">
                  <strong>1.3.</strong> These Terms apply to all natural persons, legal entities, and organizations without legal personality 
                  (hereinafter collectively: "Customer" or "User") who use the services provided by the Service Provider, regardless of whether 
                  the service is accessed in person, by telephone, via the internet, or through any other electronic channel.
                </p>

                <p className="text-muted-foreground mb-3">
                  <strong>1.4.</strong> The definitions used in these Terms are interpreted in accordance with the Payment Services Act (Cap. 590), 
                  the Financial Institutions Act (Cap. 376), the Electronic Money Regulations, and applicable European Union regulations and directives, 
                  including the Payment Services Directive 2 (PSD2) and the General Data Protection Regulation (GDPR).
                </p>

                <div className="bg-muted/30 p-4 rounded-lg mt-3">
                  <p className="text-xs font-semibold mb-2">Key Definitions:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
                    <li><strong>Payment Account:</strong> An account opened in the Customer's name for the execution of payment transactions</li>
                    <li><strong>Electronic Money:</strong> Electronically stored monetary value representing a claim against the issuer</li>
                    <li><strong>Identifier:</strong> A unique combination of letters, numbers, or symbols used to identify a payment account (IBAN)</li>
                    <li><strong>Payment Order:</strong> An instruction from the Customer to the Service Provider to execute a payment transaction</li>
                    <li><strong>Authentication:</strong> A procedure to verify the legitimacy of the use of a payment instrument</li>
                    <li><strong>Strong Customer Authentication (SCA):</strong> Authentication based on at least two independent elements</li>
                    <li><strong>Reference Exchange Rate:</strong> The exchange rate applied by the Service Provider for currency conversion</li>
                    <li><strong>Business Day:</strong> A day on which the Service Provider is open for business (Monday-Friday, excluding public holidays)</li>
                  </ul>
                </div>
              </section>

              {/* 2. SCOPE OF SERVICES */}
              <section>
                <h3 className="text-lg font-semibold mb-3">2. SCOPE OF SERVICES PROVIDED</h3>
                
                <p className="text-muted-foreground mb-3">
                  <strong>2.1. Payment Services:</strong>
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground mb-4">
                  <li>Payment account management in EUR and other currencies</li>
                  <li>Cash deposit and withdrawal services</li>
                  <li>Domestic and international credit transfers (SEPA, SWIFT)</li>
                  <li>Direct debit processing and execution</li>
                  <li>Batch payment processing</li>
                  <li>Standing order management</li>
                  <li>Electronic payment solutions (bank cards, mobile payments)</li>
                  <li>Instant payment services (real-time transfers)</li>
                </ul>

                <p className="text-muted-foreground mb-3">
                  <strong>2.2. Card Services:</strong>
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground mb-4">
                  <li>Issuance and management of debit cards</li>
                  <li>Issuance and management of credit cards</li>
                  <li>Virtual card creation for online purchases</li>
                  <li>Contactless payment functionality</li>
                  <li>Mobile payment solutions (Apple Pay, Google Pay)</li>
                  <li>Card insurance services</li>
                  <li>Card usage limit configuration</li>
                </ul>

                <p className="text-muted-foreground mb-3">
                  <strong>2.3. Lending Services:</strong>
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground mb-4">
                  <li>Overdraft facilities</li>
                  <li>Personal loans and consumer credit</li>
                  <li>Mortgage loans for residential purposes</li>
                  <li>Business loans and working capital financing</li>
                  <li>Leasing and factoring services</li>
                  <li>Credit limit increase options</li>
                </ul>

                <p className="text-muted-foreground mb-3">
                  <strong>2.4. Investment and Savings Services:</strong>
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground mb-4">
                  <li>Fixed-term deposits with various maturities</li>
                  <li>Savings accounts</li>
                  <li>Securities account management</li>
                  <li>Investment fund distribution</li>
                  <li>Government bond sales</li>
                  <li>Pension savings accounts</li>
                </ul>

                <p className="text-muted-foreground mb-3">
                  <strong>2.5. Digital Banking Services:</strong>
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground mb-4">
                  <li>Internet banking platform (web banking)</li>
                  <li>Mobile application (mobile banking)</li>
                  <li>Telephone customer service and phone banking</li>
                  <li>SMS and push notifications</li>
                  <li>Electronic account statements</li>
                  <li>Biometric authentication options (fingerprint, facial recognition)</li>
                </ul>
              </section>

              {/* 3. CONTRACT FORMATION */}
              <section>
                <h3 className="text-lg font-semibold mb-3">3. CONTRACT FORMATION, AMENDMENT, AND TERMINATION</h3>
                
                <p className="text-muted-foreground mb-3">
                  <strong>3.1.</strong> The contract between the Service Provider and the Customer is formed upon acceptance of the account opening 
                  application by the Service Provider. Contract formation requires verification of the Customer's identity and address, as well as 
                  completion of customer due diligence in accordance with anti-money laundering and counter-terrorism financing regulations.
                </p>

                <p className="text-muted-foreground mb-3">
                  <strong>3.2.</strong> Documents required for account opening for natural persons:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-muted-foreground mb-4">
                  <li>Valid identity document (passport, national ID card, or driver's license)</li>
                  <li>Proof of address (utility bill, bank statement, or government-issued document)</li>
                  <li>Tax identification number (TIN)</li>
                  <li>Telephone and email contact details</li>
                  <li>Proof of income (for certain services)</li>
                </ul>

                <p className="text-muted-foreground mb-3">
                  <strong>3.3.</strong> Additional documents required for legal entities and sole traders:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-muted-foreground mb-4">
                  <li>Certificate of incorporation or business registration</li>
                  <li>Authorized signatory specimen or signature sample</li>
                  <li>Identity documents of authorized representatives</li>
                  <li>Articles of association or memorandum of association</li>
                  <li>Tax identification number and VAT registration</li>
                  <li>Ultimate beneficial owner (UBO) declaration</li>
                </ul>

                <p className="text-muted-foreground mb-3">
                  <strong>3.4.</strong> The Service Provider reserves the right to reject an account opening application without providing reasons, 
                  particularly if the Customer does not meet regulatory requirements or if the business relationship is deemed high-risk according 
                  to the Service Provider's risk management policy.
                </p>

                <p className="text-muted-foreground mb-3">
                  <strong>3.5.</strong> Amendment of Terms:
                </p>
                <p className="text-muted-foreground mb-3 ml-4">
                  The Service Provider may unilaterally amend these Terms and the pricing published in the Tariff Schedule. The Service Provider 
                  will notify the Customer at least 60 days before the amendments take effect. The Customer may terminate the contract free of 
                  charge before the amendments take effect. If the Customer does not terminate the contract before the effective date, 
                  the amendments shall be deemed accepted.
                </p>

                <p className="text-muted-foreground mb-3">
                  <strong>3.6.</strong> Contract Termination:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground mb-4">
                  <li>Ordinary termination by the Customer or Service Provider (30 days' notice period)</li>
                  <li>Immediate termination in case of material breach of contract</li>
                  <li>Death of the Customer or dissolution without succession</li>
                  <li>Mutual agreement</li>
                  <li>Other cases specified by law</li>
                </ul>
              </section>

              {/* 4. FEES AND CHARGES */}
              <section>
                <h3 className="text-lg font-semibold mb-3">4. FEES, CHARGES, AND INTEREST RATES</h3>
                
                <p className="text-muted-foreground mb-3">
                  <strong>4.1.</strong> The fees, charges, and interest rates for services provided by the Service Provider are set out in the 
                  Tariff Schedule, which is available at the Service Provider's branches, website (www.threemail.fun), and mobile application. 
                  The Tariff Schedule forms an integral part of these Terms.
                </p>

                <p className="text-muted-foreground mb-3">
                  <strong>4.2.</strong> Types of account maintenance fees:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground mb-4">
                  <li>Monthly account maintenance fee (€0-€25 depending on package)</li>
                  <li>Transaction fees (transfers, cash withdrawals, etc.)</li>
                  <li>Annual card fee (€0-€150 depending on card type)</li>
                  <li>SMS notification fee (€0-€3/month)</li>
                  <li>Foreign exchange fee (0.5-2% of transaction value)</li>
                  <li>ATM withdrawal fee (0-1%, minimum €3)</li>
                </ul>

                <p className="text-muted-foreground mb-3">
                  <strong>4.3.</strong> Loan Interest and APR (Annual Percentage Rate):
                </p>
                <p className="text-muted-foreground mb-3 ml-4">
                  Loan interest rates may be fixed or variable. Variable rates are determined based on the central bank base rate, EURIBOR, 
                  or other reference rates. The APR includes the total cost of credit, including interest, processing fees, arrangement fees, 
                  and all other charges related to the loan. The exact APR is specified in the loan agreement.
                </p>

                <p className="text-muted-foreground mb-3">
                  <strong>4.4.</strong> Deposit Interest Rates:
                </p>
                <p className="text-muted-foreground mb-3 ml-4">
                  Interest rates paid on deposit accounts depend on the type of deposit, amount, and term. Interest may be fixed or variable. 
                  Interest is credited monthly, quarterly, semi-annually, or at maturity. Deposit interest is subject to applicable withholding 
                  tax in accordance with Maltese tax legislation, which the Service Provider deducts and remits to the tax authorities.
                </p>

                <p className="text-muted-foreground mb-3">
                  <strong>4.5.</strong> Fee-free services:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-muted-foreground mb-4">
                  <li>Electronic account statements</li>
                  <li>Internet and mobile banking usage</li>
                  <li>Cash withdrawals at own ATM network (up to monthly limit)</li>
                  <li>Domestic EUR transfers via electronic channels (up to monthly limit)</li>
                  <li>Email and mobile app notifications</li>
                </ul>

                <p className="text-muted-foreground mb-3">
                  <strong>4.6.</strong> Foreign Exchange Rates:
                </p>
                <p className="text-muted-foreground mb-3 ml-4">
                  Exchange rates for foreign currency transactions are determined and published daily by the Service Provider on its website. 
                  The exchange rate includes the Service Provider's margin. Individual rates may be negotiated for large-value transactions.
                </p>
              </section>

              {/* 5. DATA PROTECTION */}
              <section>
                <h3 className="text-lg font-semibold mb-3">5. DATA PROTECTION AND PRIVACY</h3>
                
                <p className="text-muted-foreground mb-3">
                  <strong>5.1.</strong> The Service Provider processes Customer personal data in accordance with the European Union General Data 
                  Protection Regulation (GDPR) and Maltese data protection legislation. Detailed information on data processing is provided in 
                  the Service Provider's Privacy Policy.
                </p>

                <p className="text-muted-foreground mb-3">
                  <strong>5.2.</strong> Categories of personal data processed:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-muted-foreground mb-4">
                  <li>Identification data (name, date and place of birth, parent's name)</li>
                  <li>Address and residence information</li>
                  <li>Contact details (telephone, email)</li>
                  <li>Identity document information</li>
                  <li>Tax identification number, social security number</li>
                  <li>Bank account number, transaction data</li>
                  <li>Income and asset information</li>
                  <li>Biometric data (fingerprint, facial recognition - with consent only)</li>
                </ul>

                <p className="text-muted-foreground mb-3">
                  <strong>5.3.</strong> Legal basis for data processing:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground mb-4">
                  <li>Contract performance (account management, transaction execution)</li>
                  <li>Legal obligation (anti-money laundering regulations, tax obligations)</li>
                  <li>Legitimate interest (risk management, fraud prevention)</li>
                  <li>Consent (marketing communications, biometric data processing)</li>
                </ul>

                <p className="text-muted-foreground mb-3">
                  <strong>5.4.</strong> Customer Rights:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground mb-4">
                  <li>Right of access: request information about processed data</li>
                  <li>Right to rectification: correction of inaccurate data</li>
                  <li>Right to erasure: request deletion of data (in certain cases)</li>
                  <li>Right to restriction of processing</li>
                  <li>Right to data portability: receive data in structured format</li>
                  <li>Right to object: to processing based on legitimate interest</li>
                  <li>Right to lodge a complaint: with the Office of the Information and Data Protection Commissioner</li>
                </ul>

                <p className="text-muted-foreground mb-3">
                  <strong>5.5.</strong> Data Security:
                </p>
                <p className="text-muted-foreground mb-3 ml-4">
                  The Service Provider implements appropriate technical and organizational measures to ensure data security, including encryption, 
                  access controls, regular security audits, and staff training. Data is protected using 256-bit AES encryption, and servers are 
                  continuously monitored for security threats.
                </p>
              </section>

              {/* 6. LIABILITY */}
              <section>
                <h3 className="text-lg font-semibold mb-3">6. LIABILITY PROVISIONS</h3>
                
                <p className="text-muted-foreground mb-3">
                  <strong>6.1.</strong> Service Provider's Liability:
                </p>
                <p className="text-muted-foreground mb-3 ml-4">
                  The Service Provider is liable for proper service delivery, accurate and timely execution of payment transactions, and secure 
                  handling of Customer data. The Service Provider shall compensate the Customer for damages resulting from breach of contract 
                  or violation of applicable laws.
                </p>

                <p className="text-muted-foreground mb-3">
                  <strong>6.2.</strong> Exemption from Liability:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground mb-4">
                  <li>Force majeure (unforeseeable external circumstances)</li>
                  <li>Damage caused by the Customer's intentional or grossly negligent conduct</li>
                  <li>Damage caused by legal provisions or regulatory actions</li>
                  <li>Customer's failure to fulfill information or cooperation obligations</li>
                </ul>

                <p className="text-muted-foreground mb-3">
                  <strong>6.3.</strong> Customer's Liability:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground mb-4">
                  <li>Secure storage of payment instruments (cards, passwords, biometric identifiers)</li>
                  <li>Immediate notification of loss or unauthorized use of payment instruments</li>
                  <li>Regular review of account statements and prompt reporting of errors</li>
                  <li>Notification of changes to personal data</li>
                  <li>Fulfillment of contractual obligations (fee payment, loan repayment)</li>
                </ul>

                <p className="text-muted-foreground mb-3">
                  <strong>6.4.</strong> Unauthorized or Incorrect Payment Transactions:
                </p>
                <p className="text-muted-foreground mb-3 ml-4">
                  In case of unauthorized payment transactions, the Service Provider shall immediately refund the amount to the Customer, 
                  unless there are reasonable grounds to suspect fraudulent conduct by the Customer. The Customer must report unauthorized 
                  transactions within 13 months of becoming aware. In case of incorrect execution, the Service Provider shall rectify 
                  the transaction or refund the fees.
                </p>
              </section>

              {/* 7. COMPLAINTS */}
              <section>
                <h3 className="text-lg font-semibold mb-3">7. COMPLAINTS HANDLING AND DISPUTE RESOLUTION</h3>
                
                <p className="text-muted-foreground mb-3">
                  <strong>7.1.</strong> Methods of submitting complaints:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-muted-foreground mb-4">
                  <li>In person at any Service Provider branch (Head Office: Birkirkara; Branch: Sliema, Ta' Xbiex)</li>
                  <li>By telephone: +356 2138 4567 (Mon-Fri 08:00-17:00 CET)</li>
                  <li>By email: complaints@threemail.fun</li>
                  <li>By post: Complaints Department, ThreeMail Financial Services Ltd., Level 3, Triq Dun Karm, Birkirkara BKR 9033, Malta</li>
                  <li>Through internet banking or mobile application (secure messaging)</li>
                </ul>

                <p className="text-muted-foreground mb-3">
                  <strong>7.2.</strong> The Service Provider shall investigate complaints promptly and respond in writing within 30 days. 
                  In complex cases, the response period may be extended to 60 days, of which the Customer will be notified.
                </p>

                <p className="text-muted-foreground mb-3">
                  <strong>7.3.</strong> Alternative Dispute Resolution:
                </p>
                <p className="text-muted-foreground mb-3 ml-4">
                  If the Customer is not satisfied with the Service Provider's response, they may refer the matter to the Office of the 
                  Arbiter for Financial Services (First Floor, St Calcedonius Square, Floriana FRN 1530, Malta) or initiate court proceedings.
                </p>

                <p className="text-muted-foreground mb-3">
                  <strong>7.4.</strong> Competent Authorities:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-muted-foreground mb-4">
                  <li>Malta Financial Services Authority (MFSA) - regulatory authority</li>
                  <li>Office of the Information and Data Protection Commissioner - data protection matters</li>
                  <li>Malta Competition and Consumer Affairs Authority (MCCAA) - consumer protection</li>
                  <li>Office of the Arbiter for Financial Services - financial disputes</li>
                </ul>
              </section>

              {/* 8. MISCELLANEOUS */}
              <section>
                <h3 className="text-lg font-semibold mb-3">8. MISCELLANEOUS PROVISIONS</h3>
                
                <p className="text-muted-foreground mb-3">
                  <strong>8.1.</strong> Governing Law: These Terms and the relationship between the Service Provider and the Customer 
                  are governed by the laws of Malta.
                </p>

                <p className="text-muted-foreground mb-3">
                  <strong>8.2.</strong> Jurisdiction: Disputes between the Parties shall be subject to the exclusive jurisdiction of 
                  the Maltese courts, unless otherwise provided by law.
                </p>

                <p className="text-muted-foreground mb-3">
                  <strong>8.3.</strong> Language of Communication: The language of communication between the Service Provider and the Customer 
                  is English. Other languages may be available upon request.
                </p>

                <p className="text-muted-foreground mb-3">
                  <strong>8.4.</strong> Notifications: The Service Provider shall notify the Customer of important information and changes 
                  through the contact details provided (email, SMS, post, mobile app). The Customer must promptly notify the Service Provider 
                  of any changes to contact details.
                </p>

                <p className="text-muted-foreground mb-3">
                  <strong>8.5.</strong> Banking Secrecy: The Service Provider is obliged to maintain the Customer's business secrets and 
                  banking confidentiality. Breach of banking secrecy may result in criminal and civil liability. Exceptions to banking 
                  secrecy include cases specified by law (e.g., law enforcement requests, tax authority inquiries).
                </p>

                <p className="text-muted-foreground mb-3">
                  <strong>8.6.</strong> Force Majeure: The Service Provider shall not be liable for damages resulting from force majeure, 
                  including natural disasters, war, terrorist acts, strikes, government actions, and external attacks on IT systems.
                </p>
              </section>

              {/* FINAL PROVISIONS */}
              <section className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-3">FINAL PROVISIONS</h3>
                
                <p className="text-muted-foreground mb-3">
                  These General Terms and Conditions enter into force on March 20, 2026, and remain valid until revoked. 
                  The Service Provider reserves the right to unilaterally amend these Terms subject to the conditions specified above.
                </p>

                <p className="text-muted-foreground mb-3">
                  The Service Provider undertakes to provide its services in accordance with applicable laws and professional standards, 
                  taking into account the interests of its customers.
                </p>

                <div className="bg-muted/50 p-4 rounded-lg mt-4">
                  <p className="text-xs text-muted-foreground text-center">
                    <strong>ThreeMail Financial Services Limited</strong><br />
                    Registered Office: Level 3, Triq Dun Karm, Birkirkara BKR 9033, Malta<br />
                    Company Registration: C 98765 | VAT Number: MT 12345678 | LEI: 5493007QKFXME2T8X054<br />
                    MFSA License Number: IS/89324 | SWIFT/BIC: THMAMT2M | IBAN: MT84THMM0000000000000012345<br />
                    Authorized by the Malta Financial Services Authority under the Payment Services Act (Cap. 590)<br />
                    Member of the Depositor Compensation Scheme (DCS) - Deposits protected up to €100,000<br />
                    Customer Service: +356 2138 4567 (Mon-Fri 08:00-17:00 CET) | support@threemail.fun<br />
                    Emergency Card Blocking: +356 2138 9999 (24/7)<br />
                    Website: www.threemail.fun | Compliance: compliance@threemail.fun<br />
                    <br />
                    <em>ThreeMail Financial Services Limited is subject to the supervisory oversight of the Malta Financial Services Authority,<br />
                    Notabile Road, Attard BKR 3000, Malta. For regulatory inquiries: www.mfsa.mt</em><br />
                    <br />
                    © 2026 ThreeMail Financial Services Limited. All rights reserved.<br />
                    This institution adheres to EU Directives: PSD2, MiFID II, GDPR, AML5 Directive.
                  </p>
                </div>
              </section>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
