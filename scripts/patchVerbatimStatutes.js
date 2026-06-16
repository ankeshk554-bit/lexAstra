const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'data', 'bare-acts');

const ipcTheft = `Whoever, intending to take dishonestly any moveable property out of the possession of any person without that person's consent, moves that property in order to such taking, is said to commit theft.

Explanation 1.—A thing so long as it is attached to the earth, not being movable property, is not the subject of theft; but it becomes capable of being the subject of theft as soon as it is severed from the earth.
Explanation 2.—A moving effected by the same act which affects the severance may be a theft.
Explanation 3.—A person is said to cause a thing to move by removing an obstacle which prevented it from moving or by separating it from any other thing, as well as by actually moving it.
Explanation 4.—A person who by any means causes an animal to move, is said to move that animal, and to move everything which, in consequence of the motion so caused, is moved by that animal.
Explanation 5.—The consent mentioned in the definition may be express or implied, and may be given either by the person in possession, or by any person having for that purpose authority either express or implied.

Illustrations.
(a) A cuts down a tree on Z's ground, with the intention of dishonestly taking the tree out of Z's possession without Z's consent. Here, as soon as A has severed the tree in order to such taking, he has committed theft.
(b) A puts a bait for dogs in his pocket, and thus induces Z's dog to follow it. Here, if A's intention be dishonestly to take the dog out of Z's possession without Z's consent, A has committed theft as soon as Z's dog has begun to follow A.
(c) A meets a bullock carrying a box of treasure. He drives the bullock in a certain direction, in order that he may dishonestly take the treasure. As soon as the bullock begins to move, A has committed theft of the treasure.
(d) A, being Z's servant, and entrusted by Z with the care of Z's plate, dishonestly runs away with the plate, without Z's consent. A has committed theft.
(e) Z, going on a journey, entrusts his plate to A, the keeper of a warehouse, till Z shall return. A carries the plate to a goldsmith and sells it. Here the plate was not in Z's possession. It could not therefore be taken out of Z's possession, and A has not committed theft, though he may have committed criminal breach of trust.
(f) A finds a ring belonging to Z on a table in the house which Z occupies. Here the ring is in Z's possession, and if A dishonestly removes it, A commits theft.
(g) A finds a ring lying on the high-road, not in the possession of any person. A by taking it commits no theft, though he may commit criminal misappropriation of property.
(h) A sees a ring belonging to Z lying on a table in Z's house. Not venturing to misappropriate the ring immediately for fear of search and detection, A hides the ring in a place where it is highly improbable that it will ever be found by Z, with the intention of taking the ring from the hiding place and selling it when the loss is forgotten. Here, A, at the time of first moving the ring, commits theft.
(i) A delivers his watch to Z, a jeweller, to be regulated. Z carries it to his shop. A, not owing to the jeweller any debt for which the jeweller might lawfully detain the watch as a security, enters the shop openly, takes his watch by force out of Z's hand, and carries it away. Here A, though he may have committed criminal trespass and assault, has not committed theft, inasmuch as what he did was not done dishonestly.
(j) A owes money to Z for repairing the watch, and Z retains the watch lawfully as a security for the debt. A takes the watch out of Z's possession, with the intention of depriving Z of the property as a security for his debt. A commits theft.
(k) A, having pawned his watch to Z, takes it out of Z's possession without Z's consent, not having paid what he borrowed on the watch. A commits theft, as he dishonestly deprives Z of the security.
(l) A takes an article belonging to Z out of Z's possession, without Z's consent, with the intention of keeping it until he obtains money from Z as a reward for its restoration. Here, A takes dishonestly; A has therefore committed theft.
(m) A, being on friendly terms with Z, goes into Z's library in Z's absence, and takes away a book without Z's express consent for the purpose merely of reading it, and with the intention of returning it. Here, it is probable that A's intention was not dishonest, and if so, A has not committed theft.
(n) A asks charity from Z's wife. She gives A money, food, and clothes, which A knows to be Z's property. The wife has authority to give alms. Here, A has not committed theft.
(o) A is the paramour of Z's wife. She gives A valuable property, which A knows to be her husband's property, and to be not her property to give. A takes the property dishonestly. A has committed theft.
(p) A, in good faith, believes property belonging to Z is his own property. A takes the property out of Z's possession. In this case, A does not commit theft, as he lacks the dishonest intention required for the offence.`;

const bnsTheft = `(1) Whoever, intending to take dishonestly any movable property out of the possession of any person without that person's consent, moves that property in order to such taking, is said to commit theft.

Explanation 1.—A thing so long as it is attached to the earth, not being movable property, is not the subject of theft; but it becomes capable of being the subject of theft as soon as it is severed from the earth.
Explanation 2.—A moving effected by the same act which affects the severance may be a theft.
Explanation 3.—A person is said to cause a thing to move by removing an obstacle which prevented it from moving or by separating it from any other thing, as well as by actually moving it.
Explanation 4.—A person who by any means causes an animal to move, is said to move that animal, and to move everything which, in consequence of the motion so caused, is moved by that animal.
Explanation 5.—The consent mentioned in the definition may be express or implied, and may be given either by the person in possession, or by any person having for that purpose authority either express or implied.

Illustrations.
(a) A cuts down a tree on Z's ground, with the intention of dishonestly taking the tree out of Z's possession without Z's consent. Here, as soon as A has severed the tree in order to such taking, he has committed theft.
(b) A puts a bait for dogs in his pocket, and thus induces Z's dog to follow it. Here, if A's intention be dishonestly to take the dog out of Z's possession without Z's consent, A has committed theft as soon as Z's dog has begun to follow A.
(c) A meets a bullock carrying a box of treasure. He drives the bullock in a certain direction, in order that he may dishonestly take the treasure. As soon as the bullock begins to move, A has committed theft of the treasure.
(d) A, being Z's servant, and entrusted by Z with the care of Z's plate, dishonestly runs away with the plate, without Z's consent. A has committed theft.
(e) Z, going on a journey, entrusts his plate to A, the keeper of a warehouse, till Z shall return. A carries the plate to a goldsmith and sells it. Here the plate was not in Z's possession. It could not therefore be taken out of Z's possession, and A has not committed theft, though he may have committed criminal breach of trust.
(f) A finds a ring belonging to Z on a table in the house which Z occupies. Here the ring is in Z's possession, and if A dishonestly removes it, A commits theft.
(g) A finds a ring lying on the high-road, not in the possession of any person. A by taking it commits no theft, though he may commit criminal misappropriation of property.
(h) A sees a ring belonging to Z lying on a table in Z's house. Not venturing to misappropriate the ring immediately for fear of search and detection, A hides the ring in a place where it is highly improbable that it will ever be found by Z, with the intention of taking the ring from the hiding place and selling it when the loss is forgotten. Here, A, at the time of first moving the ring, commits theft.
(i) A delivers his watch to Z, a jeweller, to be regulated. Z carries it to his shop. A, not owing to the jeweller any debt for which the jeweller might lawfully detain the watch as a security, enters the shop openly, takes his watch by force out of Z's hand, and carries it away. Here A, though he may have committed criminal trespass and assault, has not committed theft, inasmuch as what he did was not done dishonestly.
(j) A owes money to Z for repairing the watch, and Z retains the watch lawfully as a security for the debt. A takes the watch out of Z's possession, with the intention of depriving Z of the property as a security for his debt. A commits theft.
(k) A, having pawned his watch to Z, takes it out of Z's possession without Z's consent, not having paid what he borrowed on the watch. A commits theft, as he dishonestly deprives Z of the security.
(l) A takes an article belonging to Z out of Z's possession, without Z's consent, with the intention of keeping it until he obtains money from Z as a reward for its restoration. Here, A takes dishonestly; A has therefore committed theft.
(m) A, being on friendly terms with Z, goes into Z's library in Z's absence, and takes away a book without Z's express consent for the purpose merely of reading it, and with the intention of returning it. Here, it is probable that A's intention was not dishonest, and if so, A has not committed theft.
(n) A asks charity from Z's wife. She gives A money, food, and clothes, which A knows to be Z's property. The wife has authority to give alms. Here, A has not committed theft.
(o) A is the paramour of Z's wife. She gives A valuable property, which A knows to be her husband's property, and to be not her property to give. A takes the property dishonestly. A has committed theft.
(p) A, in good faith, believes property belonging to Z is his own property. A takes the property out of Z's possession. In this case, A does not commit theft, as he lacks the dishonest intention required for the offence.

(2) Whoever commits theft shall be punished with imprisonment for a term which may extend to three years, or with fine, or with both, and in the case of a second or subsequent conviction of any person under this section, he shall be punished with imprisonment of either description for a term which shall not be less than one year but which may extend to five years, and with fine:

Provided that in the case of a first conviction of any person, if the value of the stolen property is less than five thousand rupees, and the person has returned or restored the stolen property, the Court may, instead of the punishment of imprisonment or fine, sentence such person to perform community service.`;

const ipcBrd = `Whoever, being in any manner entrusted with property, or with any dominion over property, dishonestly misappropriates or converts to his own use that property, or dishonestly uses or disposes of that property in violation of any direction of law prescribing the mode in which such trust is to be discharged, or of any legal contract, express or implied, which he has made touching the discharge of such trust, or wilfully suffers any other person so to do, commits "criminal breach of trust".

Explanation 1.—A person, being the employer of an establishment whether exempted under section 17 of the Employees' Provident Funds and Miscellaneous Provisions Act, 1952 (19 of 1952), or not, who deducts the employee's contribution from the wages payable to such employee for credit to a Provident Fund or Family Pension Fund established by any law for the time being in force, shall be deemed to have been entrusted with the amount of the contribution so deducted by him and if he makes default in the payment of such contribution to the said Fund in violation of the said law, shall be deemed to have dishonestly used the amount of the said contribution in violation of a direction of law as aforesaid.
Explanation 2.—A person, being the employer of an establishment which is a factory to which the Employees' State Insurance Act, 1948 (34 of 1948), applies, who deducts the employee's contribution from the wages payable to such employee for credit to the Employees' State Insurance Fund held and administered by the Employees' State Insurance Corporation established under the said Act, shall be deemed to have been entrusted with the amount of the contribution so deducted by him and if he makes default in the payment of such contribution to the said Fund in violation of the said Act, shall be deemed to have dishonestly used the amount of the said contribution in violation of a direction of law as aforesaid.

Illustrations.
(a) A, being an executor to the will of a deceased person, dishonestly disobeys the law which directs him to divide the effects according to the will, and appropriates them to his own use. A has committed criminal breach of trust.
(b) A is a warehouse-keeper. Z, going on a journey, entrusts his furniture to A, under a contract that it shall be returned on payment of a stipulated sum for warehouse-room. A dishonestly sells the goods. A has committed criminal breach of trust.
(c) A, residing in Calcutta, is an agent for Z, residing at Delhi. There is an express or implied contract between A and Z, that all sums remitted by Z to A shall be invested by A according to Z's direction. Z remits a lakh of rupees to A, with directions to A to invest the same in Company's paper. A dishonestly disobeys the directions, and employs the money in his own business. A has committed criminal breach of trust.
(d) A, in the last illustration, does not act dishonestly, but in good faith, believing that it will be more for Z's advantage to hold shares in the Bank of Bengal, disobeys Z's directions, and buys shares in the Bank of Bengal, for Z, instead of buying Company's paper. Here, though Z should suffer a loss, and be entitled to bring a civil action against A for that loss, A, not having acted dishonestly, has not committed criminal breach of trust.
(e) A, a revenue officer, is entrusted with public money and is either directed by law, or bound by a contract, express or implied, with the Government, to pay into a certain treasury all the public money which he holds. A dishonestly appropriates the money. A has committed criminal breach of trust.
(f) A, a carrier, is entrusted by Z with property to be carried by land or by water. A dishonestly misappropriates the property. A has committed criminal breach of trust.`;

const bnsBrd = `(1) Whoever, being in any manner entrusted with property, or with any dominion over property, dishonestly misappropriates or converts to his own use that property, or dishonestly uses or disposes of that property in violation of any direction of law prescribing the mode in which such trust is to be discharged, or of any legal contract, express or implied, which he has made touching the discharge of such trust, or wilfully suffers any other person so to do, commits "criminal breach of trust".

Explanation 1.—A person, being the employer of an establishment whether exempted under section 17 of the Employees' Provident Funds and Miscellaneous Provisions Act, 1952, or not, who deducts the employee's contribution from the wages payable to such employee for credit to a Provident Fund or Family Pension Fund established by any law for the time being in force, shall be deemed to have been entrusted with the amount of the contribution so deducted by him and if he makes default in the payment of such contribution to the said Fund in violation of the said law, shall be deemed to have dishonestly used the amount of the said contribution in violation of a direction of law as aforesaid.
Explanation 2.—A person, being the employer of an establishment which is a factory to which the Employees' State Insurance Act, 1948, applies, who deducts the employee's contribution from the wages payable to such employee for credit to the Employees' State Insurance Fund held and administered by the Employees' State Insurance Corporation established under the said Act, shall be deemed to have been entrusted with the amount of the contribution so deducted by him and if he makes default in the payment of such contribution to the said Fund in violation of the said Act, shall be deemed to have dishonestly used the amount of the said contribution in violation of a direction of law as aforesaid.

Illustrations.
(a) A, being an executor to the will of a deceased person, dishonestly disobeys the law which directs him to divide the effects according to the will, and appropriates them to his own use. A has committed criminal breach of trust.
(b) A is a warehouse-keeper. Z, going on a journey, entrusts his furniture to A, under a contract that it shall be returned on payment of a stipulated sum for warehouse-room. A dishonestly sells the goods. A has committed criminal breach of trust.
(c) A, residing in Calcutta, is an agent for Z, residing at Delhi. There is an express or implied contract between A and Z, that all sums remitted by Z to A shall be invested by A according to Z's direction. Z remits a lakh of rupees to A, with directions to A to invest the same in Company's paper. A dishonestly disobeys the directions, and employs the money in his own business. A has committed criminal breach of trust.
(d) A, in the last illustration, does not act dishonestly, but in good faith, believing that it will be more for Z's advantage to hold shares in the Bank of Bengal, disobeys Z's directions, and buys shares in the Bank of Bengal, for Z, instead of buying Company's paper. Here, though Z should suffer a loss, and be entitled to bring a civil action against A for that loss, A, not having acted dishonestly, has not committed criminal breach of trust.
(e) A, a revenue officer, is entrusted with public money and is either directed by law, or bound by a contract, express or implied, with the Government, to pay into a certain treasury all the public money which he holds. A dishonestly appropriates the money. A has committed criminal breach of trust.
(f) A, a carrier, is entrusted by Z with property to be carried by land or by water. A dishonestly misappropriates the property. A has committed criminal breach of trust.

(2) Whoever commits criminal breach of trust shall be punished with imprisonment of either description for a term which may extend to five years, or with fine, or with both.

(3) Whoever, being entrusted with property as a carrier, wharfinger or warehouse-keeper, commits criminal breach of trust in respect of such property, shall be punished with imprisonment of either description for a term which may extend to seven years, and shall also be liable to fine.

(4) Whoever, being a clerk or servant or employed as a clerk or servant, and being in any manner entrusted in such capacity with property, or with any dominion over property, commits criminal breach of trust in respect of that property, shall be punished with imprisonment of either description for a term which may extend to seven years, and shall also be liable to fine.

(5) Whoever, being a public servant or in the way of his business as a banker, merchant, factor, broker, attorney or agent, is entrusted with property, or with any dominion over property in that capacity, commits criminal breach of trust in respect of that property, shall be punished with imprisonment for life, or with imprisonment of either description for a term which may extend to ten years, and shall also be liable to fine.`;

const ipcCheating = `Whoever, by deceiving any person, fraudulently or dishonestly induces the person so deceived to deliver any property to any person, or to consent that any person shall retain any property, or intentionally induces the person so deceived to do or omit to do anything which he would not do or omit if he were not so deceived, and which act or omission causes or is likely to cause damage or harm to that person in body, mind, reputation or property, is said to "cheat".

Explanation.—A dishonest concealment of facts is a deception within the meaning of this section.

Illustrations.
(a) A, by falsely pretending to be in the Civil Service, intentionally deceives Z, and thus dishonestly induces Z to let him have on credit goods for which he does not mean to pay. A cheats.
(b) A, by putting a counterfeit mark on an article, intentionally deceives Z into a belief that this article was made by a certain celebrated manufacturer, and thus dishonestly induces Z to buy and pay for the article. A cheats.
(c) A, by exhibiting to Z a false sample of an article, intentionally deceives Z into believing that the article corresponds with the sample, and thereby dishonestly induces Z to buy and pay for the article. A cheats.
(d) A, by tendering in payment for an article a bill on a house with which A keeps no money, and by which A expects that the bill will be dishonoured, intentionally deceives Z, and thereby dishonestly induces Z to deliver the article, intending not to pay for it. A cheats.
(e) A, by pledging as diamonds articles which he knows are not diamonds, intentionally deceives Z, and thereby dishonestly induces Z to lend money. A cheats.
(f) A intentionally deceives Z into a belief that A means to repay any money that Z may lend to him, and thereby dishonestly induces Z to lend him money, A not intending to repay it. A cheats.
(g) A intentionally deceives Z into a belief that A means to deliver to Z a certain quantity of indigo plant which he does not intend to deliver, and thereby dishonestly induces Z to advance money for the indigo plant, and A cheats.
(h) A intentionally deceives Z into a belief that A means to perform a certain agreement which he does not intend to perform, and thereby dishonestly induces Z to pay money to A, and A cheats.
(i) A sells and conveys an estate to B. A, knowing that in consequence of such sale he has no right to the property, sells or mortgages the same estate to C, without disclosing that fact to C, and makes C pay money for the estate or mortgage, and A cheats.`;

const bnsCheating = `(1) Whoever, by deceiving any person, fraudulently or dishonestly induces the person so deceived to deliver any property to any person, or to consent that any person shall retain any property, or intentionally induces the person so deceived to do or omit to do anything which he would not do or omit if he were not so deceived, and which act or omission causes or is likely to cause damage or harm to that person in body, mind, reputation or property, is said to "cheat".

Explanation.—A dishonest concealment of facts is a deception within the meaning of this section.

Illustrations.
(a) A, by falsely pretending to be in the Civil Service, intentionally deceives Z, and thus dishonestly induces Z to let him have on credit goods for which he does not mean to pay. A cheats.
(b) A, by putting a counterfeit mark on an article, intentionally deceives Z into a belief that this article was made by a certain celebrated manufacturer, and thus dishonestly induces Z to buy and pay for the article. A cheats.
(c) A, by exhibiting to Z a false sample of an article, intentionally deceives Z into believing that the article corresponds with the sample, and thereby dishonestly induces Z to buy and pay for the article. A cheats.
(d) A, by tendering in payment for an article a bill on a house with which A keeps no money, and by which A expects that the bill will be dishonoured, intentionally deceives Z, and thereby dishonestly induces Z to deliver the article, intending not to pay for it. A cheats.
(e) A, by pledging as diamonds articles which he knows are not diamonds, intentionally deceives Z, and thereby dishonestly induces Z to lend money. A cheats.
(f) A intentionally deceives Z into a belief that A means to repay any money that Z may lend to him, and thereby dishonestly induces Z to lend him money, A not intending to repay it. A cheats.
(g) A intentionally deceives Z into a belief that A means to deliver to Z a certain quantity of indigo plant which he does not intend to deliver, and thereby dishonestly induces Z to advance money for the indigo plant, and A cheats.
(h) A intentionally deceives Z into a belief that A means to perform a certain agreement which he does not intend to perform, and thereby dishonestly induces Z to pay money to A, and A cheats.
(i) A sells and conveys an estate to B. A, knowing that in consequence of such sale he has no right to the property, sells or mortgages the same estate to C, without disclosing that fact to C, and makes C pay money for the estate or mortgage, and A cheats.

(2) Whoever cheats shall be punished with imprisonment of either description for a term which may extend to three years, or with fine, or with both.

(3) Whoever cheats with the knowledge that he is likely thereby to cause wrongful loss to a person whose interest in the transaction to which the cheating relates he was bound, either by law, or by a legal contract, to protect, shall be punished with imprisonment of either description for a term which may extend to five years, or with fine, or with both.

(4) Whoever cheats and dishonestly induces the person deceived to deliver any property to any person, or to make, alter or destroy the whole or any part of a valuable security, or anything which is signed or sealed, and which is capable of being converted into a valuable security, shall be punished with imprisonment of either description for a term which may extend to seven years, and shall also be liable to fine.`;

const bnsCulpableHomicide = `Whoever causes death by doing an act with the intention of causing death, or with the intention of causing such bodily injury as is likely to cause death, or with the knowledge that he is likely by such act to cause death, commits the offence of culpable homicide.

Illustrations.
(a) A lays sticks and turf over a pit, with the intention of thereby causing death, or with the knowledge that death is likely to be thereby caused. Z, believing the ground to be firm, treads on it, falls in and is killed. A has committed the offence of culpable homicide.
(b) A knows Z to be behind a bush. B does not know it. A, intending to cause, or knowing it to be likely to cause Z’s death, induces B to fire at the bush. B fires and kills Z. Here B may be guilty of no offence; but A has committed the offence of culpable homicide.
(c) A, by shooting at a fowl with intent to kill and steal it, kills B, who is behind a bush; A not knowing that he was there. Here, although A was doing an unlawful act, he was not guilty of culpable homicide, as he did not intend to kill B, or to cause death by doing an act that he knew was likely to cause death.

Explanation 1.—A person who causes bodily injury to another who is labouring under a disorder, disease or bodily infirmity, and thereby accelerates the death of that other, shall be deemed to have caused his death.
Explanation 2.—Where death is caused by bodily injury, the person who causes such bodily injury shall be deemed to have caused the death, although by resorting to proper remedies and skilful treatment the death might have been prevented.
Explanation 3.—The causing of the death of a child in the mother’s womb is not homicide. But it may amount to culpable homicide to cause the death of a living child, if any part of that child has been brought forth, though the child may not have breathed or been completely born.`;

const bnsMurder = `Except in the cases hereinafter excepted, culpable homicide is murder,—
(a) if the act by which the death is caused is done with the intention of causing death; or
(b) if the act by which the death is caused is done with the intention of causing such bodily injury as the offender knows to be likely to cause the death of the person to whom the harm is caused; or
(c) if the act by which the death is caused is done with the intention of causing bodily injury to any person and the bodily injury intended to be inflicted is sufficient in the ordinary course of nature to cause death; or
(d) if the person committing the act by which the death is caused, knows that it is so imminently dangerous that it must, in all probability, cause death, or such bodily injury as is likely to cause death, and commits such act without any excuse for incurring the risk of causing death or such injury as aforesaid.

Illustrations.
(a) A shoots Z with the intention of killing him. Z dies in consequence. A commits murder.
(b) A, knowing that Z is labouring under such a disease that a blow is likely to cause his death, strikes him with the intention of causing bodily injury to him. Z dies in consequence of the blow. A is guilty of murder, although the blow might not have been sufficient in the ordinary course of nature to cause the death of a person in a sound state of health. But if A, not knowing that Z is labouring under any disease, gives him such a blow as would not in the ordinary course of nature cause the death of a person in a sound state of health, here A, although he may have intended to cause bodily injury, is not guilty of murder, if he did not intend to cause death, or such bodily injury as in the ordinary course of nature would cause death.
(c) A intentionally gives Z a sword-cut or club-wound sufficient to cause the death of a man in the ordinary course of nature. Z dies in consequence. Here, A is guilty of murder, although he may not have intended to cause Z’s death.
(d) A without any excuse fires a loaded cannon into a crowd of persons and kills one of them. A is guilty of murder, although he may not have had a premeditated design to kill any particular individual.

Exception 1.—When culpable homicide is not murder.—Culpable homicide is not murder if the offender, whilst deprived of the power of self-control by grave and sudden provocation, causes the death of the person who gave the provocation or causes the death of any other person by mistake or accident.
Subject to the following provisos:—
First.—That the provocation is not sought or voluntarily provoked by the offender as an excuse for killing or doing harm to any person.
Secondly.—That the provocation is not given by anything done in obedience to the law, or by a public servant in the lawful exercise of the powers of such public servant.
Thirdly.—That the provocation is not given by anything done in the lawful exercise of the right of private defence.
Explanation.—Whether the provocation was grave and sudden enough to prevent the offence from amounting to murder is a question of fact.

Illustrations.
(a) A, under the influence of passion excited by a provocation given by Z, intentionally kills Y, Z’s child. This is murder, inasmuch as the provocation was not given by Y, and the death of Y was not caused by accident or misfortune in doing an act caused by the provocation from Z.
(b) Y gives grave and sudden provocation to A. A, on this provocation, fires a pistol at Y, neither intending nor knowing himself to be likely to kill Z, who is near him, but out of sight. A kills Z. Here A has committed culpable homicide not amounting to murder.
(c) A is lawfully arrested by Z, a bailiff. A is excited to sudden and violent passion by the arrest, and kills Z. This is murder, as the provocation was given by anything done by Z in obedience to the law.
(d) A appears as a witness before Z, a Magistrate. Z says that he does not believe a word of A’s deposition, and that A has perjured himself. A is excited to sudden passion by these words and kills Z. This is murder.
(e) A attempts to pull Z’s nose. Z, in the exercise of the right of private defence, lays hold of A to prevent him from doing so. A is excited to sudden and violent passion by Z’s act and kills Z. This is murder, as the provocation was given by a thing done in the lawful exercise of the right of private defence.
(f) Z strikes B. B is by this provocation excited to sudden and violent passion. A, a bystander, intending to take advantage of B’s excitement, and to cause the death of Z, puts a knife into B’s hand for that purpose. B kills Z with the knife. Here B may have committed only culpable homicide, but A is guilty of murder.

Exception 2.—Culpable homicide is not murder if the offender, in the exercise in good faith of the right of private defence of person or property, exceeds the power given to him by law and causes the death of the person against whom he is exercising such right of defence without premeditation, and without any intention of doing more harm than is necessary for the purpose of such defence.
Illustration.
Z attempts to horsewhip A, not in such a manner as to cause grievous hurt to A. A draws a pistol. Z persists in the assault. A believing in good faith that he can by no other means prevent himself from being horsewhipped, shoots Z dead. A has committed culpable homicide not amounting to murder.

Exception 3.—Culpable homicide is not murder if the offender, being a public servant or aiding a public servant acting for the advancement of public justice, exceeds the powers given to him by law, and causes death by doing an act which he, in good faith, believes to be lawful and necessary for the due discharge of his duty as such public servant and without ill-will towards the person whose death is caused.

Exception 4.—Culpable homicide is not murder if it is committed without premeditation in a sudden fight in the heat of passion upon a sudden quarrel and without the offender’s having taken undue advantage or acted in a cruel or unusual manner.
Explanation.—It is immaterial in such cases which party offers the provocation or commits the first assault.

Exception 5.—Culpable homicide is not murder when the person whose death is caused, being above the age of eighteen years, suffers death or takes the risk of death with his own consent.
Illustration.
A, by instigation, voluntarily induces Z, a person under eighteen years of age, to commit suicide. Here, on Z’s youth, he was incapable of giving consent to his own destruction; A has therefore abetted murder.`;

const ipcMurder = `Except in the cases hereinafter excepted, culpable homicide is murder, if the act by which the death is caused is done with the intention of causing death, or—
Secondly.—If it is done with the intention of causing such bodily injury as the offender knows to be likely to cause the death of the person to whom the harm is caused, or—
Thirdly.—If it is done with the intention of causing bodily injury to any person and the bodily injury intended to be inflicted is sufficient in the ordinary course of nature to cause death, or—
Fourthly.—If the person committing the act knows that it is so imminently dangerous that it must, in all probability, cause death or such bodily injury as is likely to cause death, and commits such act without any excuse for incurring the risk of causing death or such injury as aforesaid.

Illustrations.
(a) A shoots Z with the intention of killing him. Z dies in consequence. A commits murder.
(b) A, knowing that Z is labouring under such a disease that a blow is likely to cause his death, strikes him with the intention of causing bodily injury to him. Z dies in consequence of the blow. A is guilty of murder, although the blow might not have been sufficient in the ordinary course of nature to cause the death of a person in a sound state of health. But if A, not knowing that Z is labouring under any disease, gives him such a blow as would not in the ordinary course of nature cause the death of a person in a sound state of health, here A, although he may have intended to cause bodily injury, is not guilty of murder, if he did not intend to cause death, or such bodily injury as in the ordinary course of nature would cause death.
(c) A intentionally gives Z a sword-cut or club-wound sufficient to cause the death of a man in the ordinary course of nature. Z dies in consequence. Here, A is guilty of murder, although he may not have intended to cause Z’s death.
(d) A without any excuse fires a loaded cannon into a crowd of persons and kills one of them. A is guilty of murder, although he may not have had a premeditated design to kill any particular individual.

Exception 1.—When culpable homicide is not murder.—Culpable homicide is not murder if the offender, whilst deprived of the power of self-control by grave and sudden provocation, causes the death of the person who gave the provocation or causes the death of any other person by mistake or accident.
Subject to the following provisos:—
First.—That the provocation is not sought or voluntarily provoked by the offender as an excuse for killing or doing harm to any person.
Secondly.—That the provocation is not given by anything done in obedience to the law, or by a public servant in the lawful exercise of the powers of such public servant.
Thirdly.—That the provocation is not given by anything done in the lawful exercise of the right of private defence.
Explanation.—Whether the provocation was grave and sudden enough to prevent the offence from amounting to murder is a question of fact.

Illustrations.
(a) A, under the influence of passion excited by a provocation given by Z, intentionally kills Y, Z’s child. This is murder, inasmuch as the provocation was not given by Y, and the death of Y was not caused by accident or misfortune in doing an act caused by the provocation from Z.
(b) Y gives grave and sudden provocation to A. A, on this provocation, fires a pistol at Y, neither intending nor knowing himself to be likely to kill Z, who is near him, but out of sight. A kills Z. Here A has committed culpable homicide not amounting to murder.
(c) A is lawfully arrested by Z, a bailiff. A is excited to sudden and violent passion by the arrest, and kills Z. This is murder, as the provocation was given by anything done by Z in obedience to the law.
(d) A appears as a witness before Z, a Magistrate. Z says that he does not believe a word of A’s deposition, and that A has perjured himself. A is excited to sudden passion by these words and kills Z. This is murder.
(e) A attempts to pull Z’s nose. Z, in the exercise of the right of private defence, lays hold of A to prevent him from doing so. A is excited to sudden and violent passion by Z’s act and kills Z. This is murder, as the provocation was given by a thing done in the lawful exercise of the right of private defence.
(f) Z strikes B. B is by this provocation excited to sudden and violent passion. A, a bystander, intending to take advantage of B’s excitement, and to cause the death of Z, puts a knife into B’s hand for that purpose. B kills Z with the knife. Here B may have committed only culpable homicide, but A is guilty of murder.

Exception 2.—Culpable homicide is not murder if the offender, in the exercise in good faith of the right of private defence of person or property, exceeds the power given to him by law and causes the death of the person against whom he is exercising such right of defence without premeditation, and without any intention of doing more harm than is necessary for the purpose of such defence.
Illustration.
Z attempts to horsewhip A, not in such a manner as to cause grievous hurt to A. A draws a pistol. Z persists in the assault. A believing in good faith that he can by no other means prevent himself from being horsewhipped, shoots Z dead. A has committed culpable homicide not amounting to murder.

Exception 3.—Culpable homicide is not murder if the offender, being a public servant or aiding a public servant acting for the advancement of public justice, exceeds the powers given to him by law, and causes death by doing an act which he, in good faith, believes to be lawful and necessary for the due discharge of his duty as such public servant and without ill-will towards the person whose death is caused.

Exception 4.—Culpable homicide is not murder if it is committed without premeditation in a sudden fight in the heat of passion upon a sudden quarrel and without the offender’s having taken undue advantage or acted in a cruel or unusual manner.
Explanation.—It is immaterial in such cases which party offers the provocation or commits the first assault.

Exception 5.—Culpable homicide is not murder when the person whose death is caused, being above the age of eighteen years, suffers death or takes the risk of death with his own consent.
Illustration.
A, by instigation, voluntarily induces Z, a person under eighteen years of age, to commit suicide. Here, on Z’s youth, he was incapable of giving consent to his own destruction; A has therefore abetted murder.`;

const cpcResJudicata = `No Court shall try any suit or issue in which the matter directly and substantially in issue has been directly and substantially in issue in a former suit between the same parties, or between parties under whom they or any of them claim, litigating under the same title, in a Court competent to try such subsequent suit or the suit in which such issue has been subsequently raised, and has been heard and finally decided by such Court.

Explanation I.—The expression "former suit" shall denote a suit which has been decided prior to the suit in question whether or not it was instituted prior thereto.
Explanation II.—For the purposes of this section, the competence of a Court shall be determined irrespective of any provisions as to a right of appeal from the decision of such Court.
Explanation III.—The matter above referred to must in the former suit have been alleged by one party and either denied or admitted, expressly or impliedly, by the other.
Explanation IV.—Any matter which might and ought to have been made ground of defence or attack in such former suit shall be deemed to have been a matter directly and substantially in issue in such suit.
Explanation V.—Any relief claimed in the plaint, which is not expressly granted by the decree, shall, for the purposes of this section, be deemed to have been refused.
Explanation VI.—Where persons litigate bona fide in respect of a public right or of a private right claimed in common for themselves and others, all persons interested in such right shall, for the purposes of this section, be deemed to claim under the persons so litigating.
Explanation VII.—The provisions of this section shall apply to a proceeding for the execution of a decree and references in this section to any suit, issue or former suit shall be construed as references, respectively, to a proceeding for the execution of the decree, question arising in such proceeding and a former proceeding for the execution of that decree.
Explanation VIII.—An issue heard and finally decided by a Court of limited jurisdiction, competent to decide such issue, shall operate as res judicata in a subsequent suit, notwithstanding that such Court of limited jurisdiction was not competent to try such subsequent suit or the suit in which such issue has been subsequently raised.`;

const ieaElectronicRecord = `(1) Notwithstanding anything contained in this Act, any information contained in an electronic record which is printed on a paper, stored, recorded or copied in optical or magnetic media produced by a computer (hereinafter referred to as the computer output) shall be deemed to be also a document, if the conditions mentioned in this section are satisfied in relation to the information and computer in question and shall be admissible in any proceedings, without further proof or production of the original, as evidence of any contents of the original or of any fact stated therein of which direct evidence would be admissible.

(2) The conditions referred to in sub-section (1) in respect of a computer output shall be the following, namely:—
(a) the computer output containing the information was produced by the computer during the period over which the computer was used regularly to store or process information for the purposes of any activities regularly carried on over that period by the person having lawful control over the use of the computer;
(b) during the said period, information of the kind contained in the electronic record or of the kind from which the information so contained is derived was regularly fed into the computer in the ordinary course of the said activities;
(c) throughout the material part of the said period, the computer was operating properly or, if not, then any period in which it was not operating properly or was out of operation during that part of that period was not such as to affect the electronic record or the accuracy of its contents; and
(d) the information contained in the electronic record reproduces or is derived from such information fed into the computer in the ordinary course of the said activities.

(3) Where over any period, the function of storing or processing information for the purposes of any activities regularly carried on over that period as mentioned in clause (a) of sub-section (2) was regularly performed by computers, whether—
(a) by a combination of computers; or
(b) by different computers in succession over that period; or
(c) by different combinations of computers in succession over that period; or
(d) in any other manner involving the successive operation over that period, in whatever order, of one or more computers and one or more combinations of computers,
all the computers used for that purpose during that period shall be treated for the purposes of this section as constituting a single computer; and references in this section to a computer shall be construed accordingly.

(4) In any proceedings where it is desired to give a statement in evidence by virtue of this section, a certificate doing any of the following things, that is to say,—
(a) identifying the electronic record containing the statement and describing the manner in which it was produced;
(b) giving such particulars of any device involved in the production of that electronic record as may be appropriate for the purpose of showing that the electronic record was produced by a computer;
(c) dealing with any of the matters to which the conditions mentioned in sub-section (2) relate,
and purporting to be signed by a person occupying a responsible official position in relation to the operation of the relevant device or the management of the relevant activities (whichever is appropriate) shall be evidence of any matter stated in the certificate; and for the purposes of this sub-section it shall be sufficient for a matter to be stated to the best of the knowledge and belief of the person stating it.`;

const contractDefinitions = `In this Act the following words and expressions are used in the following senses, unless a contrary intention appears from the context:—
(a) When one person signifies to another his willingness to do or to abstain from doing anything, with a view to obtaining the assent of that other to such act or abstinence, he is said to make a proposal;
(b) When the person to whom the proposal is made signifies his assent thereto, the proposal is said to be accepted. A proposal, when accepted, becomes a promise;
(c) The person making the proposal is called the "promisor", and the person accepting the proposal is called the "promisee";
(d) When, at the desire of the promisor, the promisee or any other person has done or abstained from doing, or does or abstains from doing, or promises to do or to abstain from doing, something, such act or abstinence or promise is called a consideration for the promise;
(e) Every promise and every set of promises, forming the consideration for each other, is an agreement;
(f) Promises which form the consideration or part of the consideration for each other are called reciprocal promises;
(g) An agreement not enforceable by law is said to be void;
(h) An agreement enforceable by law is a contract;
(i) An agreement which is enforceable by law at the option of one or more of the parties thereto, but not at the option of the other or others, is a voidable contract;
(j) A contract which ceases to be enforceable by law becomes void when it ceases to be enforceable.`;

const contractSectionTen = `All agreements are contracts if they are made by the free consent of parties competent to contract, for a lawful consideration and with a lawful object, and are not hereby expressly declared to be void.

Nothing herein contained shall affect any law in force in India, and not hereby expressly repealed, by which any contract is required to be made in writing or in the presence of witnesses, or any law relating to the registration of documents.`;

const contractSectionFiftySix = `An agreement to do an act impossible in itself is void.

Contract to do act afterwards becoming impossible or unlawful.—A contract to do an act which, after the contract is made, becomes impossible, or, by reason of some event which the promisor could not prevent, unlawful, becomes void when the act becomes impossible or unlawful.
Compensation for loss through non-performance of act known to be impossible or unlawful.—Where one person has promised to do something which he knew, or, with reasonable diligence, might have known, and which the promisee did not know, to be impossible or unlawful, such promisor must make compensation to such promisee for any loss which such promisee sustains through the non-performance of the promise.`;

const contractSectionSeventyThree = `When a contract has been broken, the party who suffers by such breach is entitled to receive, from the party who has broken the contract, compensation for any loss or damage caused to him thereby, which naturally arose in the usual course of things from such breach, or which the parties knew, when they made the contract, to be likely to result from the breach of it.

Such compensation is not to be given for any remote and indirect loss or damage sustained by reason of the breach.
Compensation for failure to discharge obligation resembling those created by contract.—When an obligation resembling those created by contract has been incurred and has not been discharged, any person injured by the failure to discharge it is entitled to receive the same compensation from the party in default, as if such person had contracted to discharge it and had broken his contract.
Explanation.—In estimating the loss or damage arising from a breach of contract, the means which existed of remedying the inconvenience caused by the non-performance of the contract must be taken into account.`;

const tpaSectionFiftyThreeA = `Where any person contracts to transfer for consideration any immoveable property by writing signed by him or on his behalf from which the terms necessary to constitute the transfer can be ascertained with reasonable certainty,
and the transferee has, in part performance of the contract, taken possession of the property or any part thereof, or the transferee, being already in possession, continues in possession in part performance of the contract and has done some act in furtherance of the contract,
and the transferee has performed or is willing to perform his part of the contract,
then, notwithstanding that where there is an instrument of transfer, that the transfer has not been completed in the manner prescribed therefor by the law for the time being in force, the transferor or any person claiming under him shall be debarred from enforcing against the transferee and persons claiming under him any right in respect of the property of which the transferee has taken or continued in possession, other than a right expressly provided by the terms of the contract:
Provided that nothing in this section shall affect the rights of a transferee for consideration who has no notice of the contract or of the part performance thereof.`;

const tpaSectionFiftyTwo = `During the dependency in any Court having authority within India of any suit or proceeding which is not collusive and in which any right to immoveable property is directly and specifically in question, the property cannot be transferred or otherwise dealt with by any party to the suit or proceeding so as to affect the rights of any other party thereto under any decree or order which may be made therein, except under the authority of the Court and on such terms as it may impose.

Explanation.—For the purposes of this section, the dependency of a suit or proceeding shall be deemed to commence from the date of the presentation of the plaint or the institution of the proceeding in a Court of competent jurisdiction, and to continue until the suit or proceeding has been disposed of by a final decree or order and complete satisfaction or discharge of such decree or order has been obtained, or has become unobtainable by reason of the expiration of any period of limitation prescribed for the execution thereof by any law for the time being in force.`;

const dowryDeathVerbatim = `(1) Where the death of a woman is caused by any burns or bodily injury or occurs otherwise than under normal circumstances within seven years of marriage and it is shown that soon before her death she was subjected to cruelty or harassment by her husband or any relative of her husband for, or in connection with, any demand for dowry, such death shall be called "dowry death", and such husband or relative shall be deemed to have caused her death.

Explanation.—For the purposes of this sub-section, "dowry" shall have the same meaning as in section 2 of the Dowry Prohibition Act, 1961.

(2) Whoever commits dowry death shall be punished with imprisonment for a term which shall not be less than seven years but which may extend to imprisonment for life.`;

// Function to update section content inside JSON file
function patchSection(fileName, secNumber, updates) {
  const filePath = path.join(targetDir, fileName);
  if (!fs.existsSync(filePath)) {
    console.warn(`File ${fileName} not found for patching.`);
    return;
  }

  try {
    const act = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let patched = false;

    if (act.chapters) {
      for (const chapter of act.chapters) {
        if (chapter.sections) {
          for (let i = 0; i < chapter.sections.length; i++) {
            if (String(chapter.sections[i].number) === String(secNumber)) {
              chapter.sections[i] = {
                ...chapter.sections[i],
                ...updates
              };
              patched = true;
              break;
            }
          }
        }
        if (patched) break;
      }
    }

    if (patched) {
      fs.writeFileSync(filePath, JSON.stringify(act, null, 2), 'utf8');
      console.log(`Successfully patched Section ${secNumber} in ${fileName}.`);
    } else {
      console.warn(`Section ${secNumber} not found in ${fileName}.`);
    }
  } catch (error) {
    console.error(`Error patching Section ${secNumber} in ${fileName}:`, error.message);
  }
}

function main() {
  console.log('Patching key statutory sections with complete verbatim texts...');

  // 1. Bharatiya Nyaya Sanhita (BNS)
  patchSection('bharatiya-nyaya-sanhita.json', '100', {
    title: 'Culpable homicide',
    text: bnsCulpableHomicide
  });
  patchSection('bharatiya-nyaya-sanhita.json', '101', {
    title: 'Murder',
    text: bnsMurder
  });

  // 2. Indian Penal Code (IPC)
  patchSection('indian-penal-code.json', '299', {
    title: 'Culpable homicide',
    text: bnsCulpableHomicide
  });
  patchSection('indian-penal-code.json', '300', {
    title: 'Murder',
    text: ipcMurder
  });
  patchSection('indian-penal-code.json', '304B', {
    title: 'Dowry death',
    text: dowryDeathVerbatim
  });

  // 2B. BNS Dowry Death (Section 80)
  patchSection('bharatiya-nyaya-sanhita.json', '80', {
    title: 'Dowry death',
    text: dowryDeathVerbatim
  });

  // 3. Code of Civil Procedure (CPC)
  patchSection('code-of-civil-procedure.json', '11', {
    title: 'Res Judicata',
    text: cpcResJudicata
  });

  // 4. Evidence Acts
  patchSection('indian-evidence-act.json', '65B', {
    title: 'Admissibility of electronic records',
    text: ieaElectronicRecord
  });

  // 5. Contract Act
  patchSection('indian-contract-act.json', '2', {
    title: 'Interpretation-clause',
    text: contractDefinitions
  });
  patchSection('indian-contract-act.json', '10', {
    title: 'What agreements are contracts',
    text: contractSectionTen
  });
  patchSection('indian-contract-act.json', '56', {
    title: 'Agreement to do impossible act',
    text: contractSectionFiftySix
  });
  patchSection('indian-contract-act.json', '73', {
    title: 'Compensation for loss or damage caused by breach of contract',
    text: contractSectionSeventyThree
  });

  // 6. Transfer of Property Act (TPA)
  patchSection('transfer-of-property-act.json', '53A', {
    title: 'Part performance',
    text: tpaSectionFiftyThreeA
  });
  patchSection('transfer-of-property-act.json', '52', {
    title: 'Transfer of property pending suit relating thereto (Lis Pendens)',
    text: tpaSectionFiftyTwo
  });

  // 7. Theft, Criminal Breach of Trust, Cheating
  // IPC
  patchSection('indian-penal-code.json', '378', {
    title: 'Theft',
    text: ipcTheft
  });
  patchSection('indian-penal-code.json', '405', {
    title: 'Criminal breach of trust',
    text: ipcBrd
  });
  patchSection('indian-penal-code.json', '415', {
    title: 'Cheating',
    text: ipcCheating
  });
  // BNS
  patchSection('bharatiya-nyaya-sanhita.json', '303', {
    title: 'Theft',
    text: bnsTheft
  });
  patchSection('bharatiya-nyaya-sanhita.json', '316', {
    title: 'Criminal breach of trust',
    text: bnsBrd
  });
  patchSection('bharatiya-nyaya-sanhita.json', '318', {
    title: 'Cheating',
    text: bnsCheating
  });

  console.log('Verbatim statutory section patching completed!');
}

main();
