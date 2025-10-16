/** @format */
"use client";

import { useState } from "react";
import { X, Star, Zap, Crown, Check, ArrowRight, Loader2 } from "lucide-react";
import { useCompanyAuth } from "@/context/CompanyAuthContext";

type Plan = {
	name: string;
	price: string;
	period: string;
	planType: string; // 'monthly', '6months', 'yearly'
	originalPrice?: string | null;
	discount?: string | null;
	features: string[];
	popular?: boolean;
	color: string; // tailwind gradient colors
	icon: React.ComponentType<{ className?: string }>;
};

type PlanPurchaseProps = {
	onClose: () => void;
	onSelectPlan?: (plan: Plan) => void;
};

const plans: Plan[] = [
	{
		name: "Aylık",
		price: "649",
		period: "ay",
		planType: "monthly",
		features: [
			"Sınırsız puan kazanma",
			"Tüm işletmelerde geçerli",
			"7/24 müşteri desteği",
			"Temel raporlama",
		],
		popular: false,
		color: "from-blue-500 to-purple-600",
		icon: Zap,
	},
	{
		name: "6 Aylık",
		price: "2 999",
		period: "6 ay",
		planType: "6months",
		originalPrice: "3 894",
		discount: "23%",
		features: [
			"Aylık planın tüm özellikleri",
			"Öncelikli müşteri desteği",
			"Gelişmiş raporlama",
			"Özel kampanya bildirimleri",
		],
		popular: true,
		color: "from-yellow-500 to-orange-600",
		icon: Star,
	},
	{
		name: "Yıllık",
		price: "4 999",
		period: "yıl",
		planType: "yearly",
		originalPrice: "7 788",
		discount: "36%",
		features: [
			"6 aylık planın tüm özellikleri",
			"VIP müşteri desteği",
			"Premium raporlama ve analitik",
			"Özel etkinlik davetleri",
		],
		popular: false,
		color: "from-purple-500 to-pink-600",
		icon: Crown,
	},
];

export default function PlanPurchase({ onClose, onSelectPlan }: PlanPurchaseProps) {
	const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
	const [isProcessing, setIsProcessing] = useState(false);
	const { company } = useCompanyAuth();
	const [iframeToken, setIframeToken] = useState<string | null>(null);

	const handlePayment = async () => {
		if (!selectedPlan || !company) return;

		setIsProcessing(true);
		try {
			const response = await fetch("/api/payment/paytr", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					planType: selectedPlan.planType,
					companyId: company.companyId,
				}),
			});

			const data = await response.json();

			if (data.success) {
				// iFrame için token'ı state'e koy ve modal içinde göster
				setIframeToken(data.token);
			} else {
				alert(`Ödeme başlatılamadı: ${data.error}`);
			}
		} catch (error) {
			console.error("Payment error:", error);
			alert("Ödeme işlemi sırasında bir hata oluştu.");
		} finally {
			setIsProcessing(false);
		}
	};

	return (
		<div className="fixed inset-0 z-[1000] flex items-center justify-center p-2 sm:p-4">
			<div className="absolute inset-0 bg-black/70" onClick={onClose}></div>
			<div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-gray-900 text-white rounded-xl sm:rounded-2xl border border-gray-800 shadow-2xl">
				{/* Header */}
				<div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-800 sticky top-0 bg-gray-900 z-10">
					<div className="flex-1 pr-2">
						<h2 className="text-lg sm:text-xl font-bold">Ödeme Planı Seçimi</h2>
						<p className="text-xs sm:text-sm text-gray-400">İhtiyacınıza uygun paketi seçin</p>
					</div>
					<button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-800 flex-shrink-0">
						<X className="w-5 h-5" />
					</button>
				</div>

				{/* Plans */}
				<div className="p-3 sm:p-6">
					{/* iFrame ödeme alanı */}
					{iframeToken ? (
						<div className="w-full">
							<div className="mb-3 sm:mb-4 text-sm text-gray-300">Ödeme sayfası yüklendi. İşlemi tamamladıktan sonra bu pencere otomatik kapanabilir.</div>
							<iframe
								src={`https://www.paytr.com/odeme/guvenli/${iframeToken}`}
								title="PayTR Ödeme"
								style={{ width: "100%", height: "75vh", border: 0 }}
								allow="payment"
							/>
							<div className="mt-3 sm:mt-4 flex justify-end">
								<button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700">Kapat</button>
							</div>
						</div>
					) : (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
						{plans.map((plan) => {
							const Icon = plan.icon;
							const isSelected = selectedPlan?.name === plan.name;
							return (
								<div
									key={plan.name}
									className={`relative rounded-xl sm:rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer ${
										plan.popular
											? "border-yellow-500/70 shadow-yellow-500/10 shadow-xl"
											: "border-gray-800 hover:border-gray-700"
									} ${isSelected ? "ring-2 ring-yellow-500" : ""}`}
									onClick={() => setSelectedPlan(plan)}
								>
									{plan.popular && (
										<div className="absolute -top-2 sm:-top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-orange-600 text-black px-3 sm:px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1 sm:gap-2">
											<Star className="w-3 h-3" /> En Popüler
										</div>
									)}

									<div className="text-center mb-4 sm:mb-5">
										<div className={`w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-2 sm:mb-3 rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center`}>
											<Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
										</div>
										<h3 className="text-base sm:text-lg font-bold mb-1">{plan.name}</h3>
										<div className="mb-2">
											<span className="text-2xl sm:text-3xl font-extrabold">₺{plan.price}</span>
											<span className="text-gray-400 text-sm sm:text-base">/{plan.period}</span>
										</div>
										{plan.originalPrice && (
											<div className="flex items-center justify-center gap-2">
												<span className="text-xs sm:text-sm text-gray-400 line-through">₺{plan.originalPrice}</span>
												<span className="bg-green-500 text-black px-2 py-0.5 rounded-full text-xs font-bold">
													{plan.discount} İndirim
												</span>
						</div>
					)}
				</div>

									<ul className="space-y-2 mb-4 sm:mb-5">
										{plan.features.map((f) => (
											<li key={f} className="flex items-start gap-2 text-xs sm:text-sm text-gray-300">
												<Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 flex-shrink-0 mt-0.5" /> 
												<span>{f}</span>
											</li>
										))}
									</ul>

									<button
										className={`w-full py-2.5 sm:py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all text-sm sm:text-base ${
											plan.popular
												? "bg-gradient-to-r from-yellow-500 to-orange-600 text-black hover:from-yellow-600 hover:to-orange-700"
												: "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
										}`}
										onClick={() => setSelectedPlan(plan)}
									>
										Planı Seç <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
									</button>
								</div>
							);
						})}
					</div>
					)}
 
                     {/* Footer actions */}
					<div className="mt-4 sm:mt-6 flex flex-col gap-3 sm:gap-4">
						<div className="text-xs sm:text-sm text-gray-400 text-center">
							Seçili plan: <span className="font-semibold text-white">{selectedPlan?.name ?? "—"}</span>
						</div>
						<div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
							<button
								onClick={onClose}
								className="flex-1 px-4 py-2.5 sm:py-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-sm sm:text-base"
							>
								İptal
							</button>
							<button
								onClick={handlePayment}
								disabled={!selectedPlan || isProcessing}
								className="flex-1 px-4 py-2.5 sm:py-2 rounded-lg bg-yellow-500 text-black font-semibold disabled:opacity-60 disabled:cursor-not-allowed hover:bg-yellow-600 text-sm sm:text-base flex items-center justify-center gap-2"
							>
								{isProcessing ? (
									<>
										<Loader2 className="w-4 h-4 animate-spin" />
										İşleniyor...
									</>
								) : (
									"Ödeme Yap"
								)}
							</button>
							</div>
					</div>
				</div>
			</div>
		</div>
	);
}
