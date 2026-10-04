# TwinMOS Website — Translation Memory & Terminology Glossary

**Document Reference:** TWN-F4-GLOSSARY-2026-001
**Version:** 1.0
**Status:** Approved — Baseline
**Owner:** Localization Lead
**Last Updated:** 1 May 2026
**Related Documents:** TWN-F4-VENDOR-2026-001 (Translation Vendor Brief), TWN-F4-L10N-2026-001 (Localization Strategy), TWN-F2-STYLE-2026-001 (Editorial Style Guide)

---

## Table of Contents

1. [Overview and Purpose](#1-overview-and-purpose)
2. [Do-Not-Translate Master List](#2-do-not-translate-master-list)
3. [Memory Technology Terms](#3-memory-technology-terms)
4. [Storage Technology Terms](#4-storage-technology-terms)
5. [UI Strings](#5-ui-strings)
6. [Support and Service Terms](#6-support-and-service-terms)
7. [Legal and Compliance Terms](#7-legal-and-compliance-terms)
8. [Regional Compliance Certification Terms](#8-regional-compliance-certification-terms)
9. [Marketing and Brand Terms](#9-marketing-and-brand-terms)
10. [Navigation and Category Labels](#10-navigation-and-category-labels)
11. [Translation Memory Guidelines](#11-translation-memory-guidelines)
12. [Glossary Maintenance and Governance](#12-glossary-maintenance-and-governance)
13. [Tool Integration Notes](#13-tool-integration-notes)

---

## 1. Overview and Purpose

This document serves as the **master terminology reference** for all TwinMOS website translation and localisation work. It provides:

1. **Do-not-translate list** — terms that must appear in English regardless of target language.
2. **Approved translations** — for all core terms in each target language.
3. **Transliteration guidance** — for technical terms borrowed into the target language phonetically.
4. **UI string translations** — for buttons, labels, error messages, and interface copy.
5. **Legal and compliance term translations** — reviewed by legal counsel for accuracy.

**Approved Locales:** AR (Arabic), BN (Bengali), HI (Hindi), RU (Russian), ZH-CN (Simplified Chinese), FR (French)

**Legend:**
- **[DNT]** — Do Not Translate. Use the EN source term exactly as written.
- **[TR]** — Transliterate (write the phonetic equivalent in the target script).
- **[TL]** — Translate (use the approved semantic translation).
- **[ABBR]** — Abbreviation; use the EN abbreviation (no change needed).
- **(Native)** — A native-language term exists and should be preferred.

---

## 2. Do-Not-Translate Master List

The following terms must NEVER be translated, transliterated, or adapted. They appear exactly as written in English in all target languages.

### 2.1 Brand Names

| Term | Usage Rule |
|---|---|
| TwinMOS | Always in Latin script; never translated |
| VOLTX | Always in Latin script, all caps |
| CoreX Pro | Always in Latin script; capitalise as shown |
| TornadoX7 | Always in Latin script; capitalise as shown |
| Thunder GX | Always in Latin script; capitalise as shown |
| Xtreme | Always in Latin script; capitalise as shown |
| Alpha Pro | Always in Latin script; capitalise as shown |
| XPERT | Always in Latin script, all caps |
| StarPro | Always in Latin script; capitalise as shown |

### 2.2 Product SKU Codes

All product SKUs remain in Latin characters. Examples:
- `MDD564GB6000HC30ABRGB`
- `MDD532GB4800HC40AB`
- `SNM2PCIEG5512CBPRO`
- `SNM2PCIEG41TBCXP`
- `SUFD32GBUSB32X`

### 2.3 Technology Standards (Always EN Abbreviation)

| Term | Notes |
|---|---|
| DDR5, DDR4, DDR3, DDR2 | Memory generation standards |
| LPDDR5, LPDDR4, LPDDR4X | Low-power memory standards |
| LPDDR5X | Extended low-power standard |
| NVMe | Non-Volatile Memory Express |
| PCIe, PCI-E | Peripheral Component Interconnect Express |
| PCIe Gen 5.0, Gen 4.0, Gen 3.0 | PCIe generations |
| M.2 | Form factor designation |
| SATA | Serial ATA |
| USB 3.2, USB 3.1, USB 3.0 | USB generation standards |
| USB-C, USB-A, USB-B | Connector types |
| UHS-I, UHS-II, UHS-III | SD card speed class |
| SDXC, SDHC | SD card capacity standards |
| ECC | Error-Correcting Code |
| XMP 3.0, XMP 2.0 | Intel eXtreme Memory Profile |
| AMD EXPO | AMD Extended Profiles for Overclocking |
| JEDEC | Joint Electron Device Engineering Council |
| RGB | Red Green Blue (lighting) |
| MHz, GHz, MT/s | Frequency units — abbreviations only |
| GB, TB, MB | Storage capacity units — abbreviations only |
| GBps, MBps, IOPS | Throughput units |
| TBW | Terabytes Written |
| MTBF | Mean Time Between Failures |
| CAS, CL, tRCD, tRP, tRAS | Latency timing notation |

### 2.4 Domain and URLs

| Term | Notes |
|---|---|
| twinmos.com | Domain — always in Latin script |
| All URL paths | `/products/`, `/learn/`, `/support/` etc. — always Latin |
| All email addresses | e.g., `support@twinmos.com` — always Latin |

---

## 3. Memory Technology Terms

### 3.1 Core Memory Glossary

| English Term | AR (Arabic) | BN (Bengali) | HI (Hindi) | RU (Russian) | ZH-CN (Chinese) | FR (French) |
|---|---|---|---|---|---|---|
| Memory | ذاكرة [TL] | মেমোরি [TR] | मेमोरी [TR] | Память [TL/Native] | 内存 [TL] | Mémoire [TL] |
| RAM | ذاكرة الوصول العشوائي [TL] / رام [TR] | র‍্যাম [TR] | रैम [TR] | ОЗУ [TL/Native] / RAM [ABBR] | 随机存取存储器 [TL] / 内存 [colloquial] | RAM [ABBR] |
| RAM module | وحدة ذاكرة | র‍্যাম মডিউল | रैम मॉड्यूल | Модуль памяти | 内存条 | Barrette de RAM |
| DRAM | ذاكرة الوصول العشوائي الديناميكية | ডিআরএএম [TR] | डीआरएएम [TR] | ДОЗУ / DRAM | 动态随机存取存储器 / DRAM | DRAM [ABBR] |
| Gaming memory | ذاكرة الألعاب | গেমিং মেমোরি | गेमिंग मेमोरी | Игровая память | 游戏内存 | Mémoire gaming |
| DDR5 memory | ذاكرة DDR5 [DNT for DDR5] | DDR5 মেমোরি | DDR5 मेमोरी | Память DDR5 | DDR5内存 | Mémoire DDR5 |
| Memory speed | سرعة الذاكرة | মেমোরি গতি | मेमोरी स्पीड | Скорость памяти | 内存频率 | Vitesse mémoire |
| Memory frequency | تردد الذاكرة | মেমোরি ফ্রিকোয়েন্সি | मेमोरी फ्रीक्वेंसी | Частота памяти | 内存频率 | Fréquence mémoire |
| Memory timing | توقيت الذاكرة | মেমোরি টাইমিং | मेमोरी टाइमिंग | Тайминги памяти | 内存时序 | Timings mémoire |
| Latency | الكمون | লেটেন্সি | लेटेंसी | Задержка / Латентность | 延迟 | Latence |
| Bandwidth | عرض النطاق الترددي | ব্যান্ডউইথ | बैंडविड्थ | Пропускная способность | 带宽 | Bande passante |
| Overclocking | رفع تردد التشغيل / أوفركلوك | ওভারক্লকিং | ओवरक्लॉकिंग | Разгон | 超频 | Overclocking |
| Heatspreader | لوح تبريد / هيتسبريدر | হিটস্প্রেডার | हीटस्प्रेडर | Радиатор | 散热片 | Dissipateur thermique |
| Heat sink | مبدد حراري | হিটসিংক | हीटसिंक | Радиатор охлаждения | 散热器 | Dissipateur de chaleur |
| RGB lighting | إضاءة RGB [DNT for RGB] | RGB লাইটিং | RGB लाइटिंग | RGB подсветка | RGB灯效 | Éclairage RGB |
| Dual-channel | ثنائي القناة | ডুয়াল চ্যানেল | ड्यूल चैनल | Двухканальный | 双通道 | Double canal |
| Quad-channel | رباعي القناة | কোয়াড চ্যানেল | क्वाड चैनल | Четырёхканальный | 四通道 | Quadruple canal |
| ECC memory | ذاكرة ECC [DNT for ECC] | ECC মেমোরি | ECC मेमोरी | Память с коррекцией ошибок ECC | ECC内存 | Mémoire ECC |
| Compatibility | التوافق | সামঞ্জস্যতা | अनुकूलता | Совместимость | 兼容性 | Compatibilité |
| Compatible with | متوافق مع | এর সাথে সামঞ্জস্যপূর্ণ | के साथ अनुकूल | Совместим с | 兼容 | Compatible avec |
| Motherboard | اللوحة الأم | মাদারবোর্ড | मदरबोर्ड | Материнская плата | 主板 | Carte mère |
| DIMM | ذاكرة DIMM [DNT for DIMM] | ডিআইএমএম | डीआईएमएम | DIMM | DIMM | DIMM |
| SO-DIMM | ذاكرة SO-DIMM [DNT for SO-DIMM] | এসও-ডিআইএমএম | एसओ-डीआईएमएम | SO-DIMM | SO-DIMM | SO-DIMM |
| Memory slot | فتحة الذاكرة | মেমোরি স্লট | मेमोरी स्लॉट | Слот памяти | 内存插槽 | Emplacement mémoire |
| Maximum capacity | السعة القصوى | সর্বোচ্চ ক্ষমতা | अधिकतम क्षमता | Максимальный объём | 最大容量 | Capacité maximale |
| Capacity | السعة | ক্ষমতা | क्षमता | Объём | 容量 | Capacité |

---

## 4. Storage Technology Terms

### 4.1 Core Storage Glossary

| English Term | AR (Arabic) | BN (Bengali) | HI (Hindi) | RU (Russian) | ZH-CN (Chinese) | FR (French) |
|---|---|---|---|---|---|---|
| Solid-state drive | محرك الأقراص الصلبة / SSD [ABBR] | সলিড-স্টেট ড্রাইভ | सॉलिड-स्टेट ड्राइव | Твердотельный накопитель / ТТН | 固态硬盘 / SSD | Disque SSD |
| SSD | إس إس دي [TR] / SSD [ABBR] | এসএসডি [TR] | एसएसडी [TR] | ТТН / SSD [ABBR] | 固态硬盘 | SSD |
| NVMe SSD | محرك SSD بواجهة NVMe [DNT for NVMe] | NVMe SSD | NVMe SSD | NVMe ТТН | NVMe 固态硬盘 | SSD NVMe |
| Storage | التخزين | স্টোরেজ | स्टोरेज | Накопитель / Хранилище | 存储 | Stockage |
| Read speed | سرعة القراءة | পড়ার গতি | रीड स्पीड | Скорость чтения | 读取速度 | Vitesse de lecture |
| Write speed | سرعة الكتابة | লেখার গতি | राइट स्पीड | Скорость записи | 写入速度 | Vitesse d'écriture |
| Sequential read | قراءة تسلسلية | সিকোয়েন্শিয়াল রিড | सीक्वेंशियल रीड | Последовательное чтение | 顺序读取 | Lecture séquentielle |
| Sequential write | كتابة تسلسلية | সিকোয়েন্শিয়াল রাইট | सीक्वेंशियल राइट | Последовательная запись | 顺序写入 | Écriture séquentielle |
| Random read | قراءة عشوائية | র‍্যান্ডম রিড | रैंडम रीड | Случайное чтение | 随机读取 | Lecture aléatoire |
| Random write | كتابة عشوائية | র‍্যান্ডম রাইট | रैंडम राइट | Случайная запись | 随机写入 | Écriture aléatoire |
| IOPS | عمليات الإدخال/الإخراج في الثانية / IOPS | আইওপিএস / IOPS | आईओपीएस / IOPS | IOPS | IOPS | IOPS |
| Endurance | القدرة على التحمل | স্থায়িত্ব | स्थायित्व | Ресурс / Надёжность | 耐用性 | Endurance |
| TBW (Terabytes Written) | تيرابايت مكتوبة / TBW [ABBR] | TBW | TBW | TBW | TBW | TBW |
| NAND flash | فلاش NAND [DNT for NAND] | NAND ফ্ল্যাশ | NAND फ्लैश | NAND-флеш | NAND闪存 | Flash NAND |
| 3D NAND | ثلاثي الأبعاد NAND / 3D NAND | 3D NAND | 3D NAND | 3D NAND | 3D NAND | 3D NAND |
| Controller | وحدة تحكم | কন্ট্রোলার | कंट्रोलर | Контроллер | 主控芯片 / 控制器 | Contrôleur |
| Cache | ذاكرة التخزين المؤقت | ক্যাশ | कैश | Кэш | 缓存 | Cache |
| Form factor | عامل الشكل | ফর্ম ফ্যাক্টর | फॉर्म फैक्टर | Форм-фактор | 外形规格 | Facteur de forme |
| Portable SSD | محرك SSD محمول | পোর্টেবল SSD | पोर्टेबल SSD | Портативный ТТН | 便携式固态硬盘 | SSD portable |
| USB flash drive | محرك أقراص فلاش USB | USB ফ্ল্যাশ ড্রাইভ | USB फ्लैश ड्राइव | USB-флеш-накопитель / Флешка | U盘 / USB闪存盘 | Clé USB |
| Memory card | بطاقة ذاكرة | মেমোরি কার্ড | मेमोरी कार्ड | Карта памяти | 存储卡 | Carte mémoire |
| Operating temperature | درجة حرارة التشغيل | অপারেটিং তাপমাত্রা | ऑपरेटिंग तापमान | Рабочая температура | 工作温度 | Température de fonctionnement |
| Warranty | الضمان | ওয়ারেন্টি | वारंटी | Гарантия | 保修 | Garantie |

---

## 5. UI Strings

### 5.1 Navigation and Actions

| English String | AR (Arabic) | BN (Bengali) | HI (Hindi) | RU (Russian) | ZH-CN (Chinese) | FR (French) |
|---|---|---|---|---|---|---|
| Products | المنتجات | পণ্য | उत्पाद | Продукты | 产品 | Produits |
| Learn | تعلّم | জানুন | सीखें | Узнать | 了解 | Apprendre |
| Support | الدعم | সহায়তা | सहायता | Поддержка | 支持 | Assistance |
| About | حول الشركة | আমাদের সম্পর্কে | हमारे बारे में | О компании | 关于我们 | À propos |
| Contact | اتصل بنا | যোগাযোগ | संपर्क | Контакты | 联系我们 | Contact |
| Where to Buy | أين تشتري | কোথায় কিনবেন | कहाँ से खरीदें | Где купить | 购买渠道 | Où acheter |
| Careers | وظائف | ক্যারিয়ার | करियर | Карьера | 招聘 | Carrières |
| News | أخبار | সংবাদ | समाचार | Новости | 新闻 | Actualités |
| Search | بحث | অনুসন্ধান | खोजें | Поиск | 搜索 | Rechercher |
| Home | الرئيسية | হোম | होम | Главная | 首页 | Accueil |
| Back | رجوع | পিছনে | वापस | Назад | 返回 | Retour |
| Next | التالي | পরবর্তী | अगला | Следующий | 下一页 | Suivant |
| Previous | السابق | আগের | पिछला | Предыдущий | 上一页 | Précédent |
| View all | عرض الكل | সব দেখুন | सभी देखें | Показать все | 查看全部 | Voir tout |
| Show more | عرض المزيد | আরও দেখুন | और दिखाएं | Показать ещё | 显示更多 | Afficher plus |
| Show less | عرض أقل | কম দেখুন | कम दिखाएं | Показать меньше | 显示更少 | Afficher moins |
| Download | تحميل | ডাউনলোড | डाउनलोड | Скачать | 下载 | Télécharger |
| Learn more | معرفة المزيد | আরও জানুন | अधिक जानें | Подробнее | 了解更多 | En savoir plus |
| Compare | مقارنة | তুলনা করুন | तुलना करें | Сравнить | 对比 | Comparer |
| Find my memory | اعثر على ذاكرتي | আমার মেমোরি খুঁজুন | मेरी मेमोरी खोजें | Подобрать память | 查找我的内存 | Trouver ma mémoire |
| Buy now | اشتري الآن | এখনই কিনুন | अभी खरीदें | Купить сейчас | 立即购买 | Acheter maintenant |
| Add to wishlist | أضف إلى قائمة الأمنيات | উইশলিস্টে যোগ করুন | विशलिस्ट में जोड़ें | В список желаний | 加入心愿单 | Ajouter à la liste |
| Share | مشاركة | শেয়ার করুন | साझा करें | Поделиться | 分享 | Partager |
| Print | طباعة | প্রিন্ট | प्रिंट | Печать | 打印 | Imprimer |
| Filter | تصفية | ফিল্টার | फ़िल्टर | Фильтр | 筛选 | Filtrer |
| Sort by | ترتيب حسب | এর ভিত্তিতে সাজান | के अनुसार क्रमबद्ध | Сортировать по | 排序方式 | Trier par |
| Reset | إعادة تعيين | রিসেট | रीसेट | Сбросить | 重置 | Réinitialiser |
| Submit | إرسال | জমা দিন | जमा करें | Отправить | 提交 | Soumettre |
| Cancel | إلغاء | বাতিল | रद्द करें | Отмена | 取消 | Annuler |
| Confirm | تأكيد | নিশ্চিত করুন | पुष्टि करें | Подтвердить | 确认 | Confirmer |
| Close | إغلاق | বন্ধ করুন | बंद करें | Закрыть | 关闭 | Fermer |
| Menu | القائمة | মেনু | मेनू | Меню | 菜单 | Menu |
| Language | اللغة | ভাষা | भाषा | Язык | 语言 | Langue |

### 5.2 E-Commerce and Product Page Strings

| English String | AR (Arabic) | BN (Bengali) | HI (Hindi) | RU (Russian) | ZH-CN (Chinese) | FR (French) |
|---|---|---|---|---|---|---|
| Specifications | المواصفات | স্পেসিফিকেশন | विशिष्टताएँ | Характеристики | 规格参数 | Caractéristiques |
| Features | الميزات | বৈশিষ্ট্য | विशेषताएं | Особенности | 功能特性 | Fonctionnalités |
| Overview | نظرة عامة | ওভারভিউ | अवलोकन | Обзор | 概览 | Aperçu |
| Reviews | التقييمات | রিভিউ | समीक्षाएं | Отзывы | 用户评价 | Avis |
| In the box | محتويات العلبة | বাক্সে কী আছে | बॉक्स में क्या है | Комплект поставки | 包装清单 | Contenu de la boîte |
| Product images | صور المنتج | পণ্যের ছবি | उत्पाद की छवियां | Изображения товара | 产品图片 | Images du produit |
| Part number | رقم القطعة | পার্ট নম্বর | पार्ट नंबर | Артикул | 型号 | Référence produit |
| Availability | التوفر | উপলব্ধতা | उपलब्धता | Наличие | 库存状态 | Disponibilité |
| In stock | متاح | স্টকে আছে | स्टॉक में | В наличии | 有货 | En stock |
| Out of stock | غير متاح | স্টক নেই | स्टॉक में नहीं | Нет в наличии | 缺货 | Rupture de stock |
| Find a retailer | اعثر على بائع | একজন রিটেইলার খুঁজুন | एक रिटेलर खोजें | Найти продавца | 查找零售商 | Trouver un revendeur |
| All variants | جميع المتغيرات | সব ভ্যারিয়েন্ট | सभी वेरिएंट | Все варианты | 所有规格 | Toutes les variantes |
| Related products | المنتجات ذات الصلة | সম্পর্কিত পণ্য | संबंधित उत्पाद | Похожие товары | 相关产品 | Produits associés |

### 5.3 Support and Error Strings

| English String | AR (Arabic) | BN (Bengali) | HI (Hindi) | RU (Russian) | ZH-CN (Chinese) | FR (French) |
|---|---|---|---|---|---|---|
| Get support | الحصول على الدعم | সহায়তা পান | सहायता प्राप्त करें | Получить поддержку | 获取支持 | Obtenir de l'aide |
| Contact support | التواصل مع الدعم | সাপোর্টের সাথে যোগাযোগ করুন | सहायता से संपर्क करें | Связаться с поддержкой | 联系客服 | Contacter l'assistance |
| Submit a ticket | إرسال تذكرة | টিকেট জমা দিন | टिकट जमा करें | Создать обращение | 提交工单 | Soumettre un ticket |
| FAQ | الأسئلة الشائعة | সচরাচর জিজ্ঞাসা | अक्सर पूछे जाने वाले प्रश्न | Частые вопросы | 常见问题 | Foire aux questions |
| Knowledge base | قاعدة المعرفة | নলেজ বেস | ज्ञानकोश | База знаний | 知识库 | Base de connaissances |
| Troubleshooting | استكشاف الأخطاء | ট্রাবলশুটিং | समस्या निवारण | Устранение неполадок | 故障排除 | Dépannage |
| Page not found | الصفحة غير موجودة | পৃষ্ঠা পাওয়া যায়নি | पृष्ठ नहीं मिला | Страница не найдена | 页面未找到 | Page introuvable |
| Something went wrong | حدث خطأ ما | কিছু একটা ভুল হয়েছে | कुछ गलत हो गया | Что-то пошло не так | 出现了错误 | Une erreur s'est produite |
| Try again | حاول مرة أخرى | আবার চেষ্টা করুন | पुनः प्रयास करें | Попробовать снова | 重试 | Réessayer |
| No results found | لا توجد نتائج | কোনো ফলাফল পাওয়া যায়নি | कोई परिणाम नहीं मिला | Результаты не найдены | 未找到结果 | Aucun résultat trouvé |

---

## 6. Support and Service Terms

| English Term | AR (Arabic) | BN (Bengali) | HI (Hindi) | RU (Russian) | ZH-CN (Chinese) | FR (French) |
|---|---|---|---|---|---|---|
| Warranty | الضمان | ওয়ারেন্টি | वारंटी | Гарантия | 保修 | Garantie |
| Warranty period | فترة الضمان | ওয়ারেন্টি মেয়াদ | वारंटी अवधि | Гарантийный срок | 保修期 | Période de garantie |
| Lifetime warranty | ضمان مدى الحياة | আজীবন ওয়ারেন্টি | आजीवन वारंटी | Пожизненная гарантия | 终身保修 | Garantie à vie |
| RMA | طلب إرجاع المنتج / RMA [ABBR] | আরএমএ / RMA | आरएमए / RMA | RMA / Возврат | RMA | RMA |
| Return | إرجاع | রিটার্ন | वापसी | Возврат | 退货 | Retour |
| Replacement | استبدال | প্রতিস্থাপন | प्रतिस्थापन | Замена | 更换 | Remplacement |
| Repair | إصلاح | মেরামত | मरम्मत | Ремонт | 维修 | Réparation |
| Driver | تعريف / درايفر | ড্রাইভার | ड्राइवर | Драйвер | 驱动程序 | Pilote |
| Firmware | البرنامج الثابت / فيرمور [TR] | ফার্মওয়্যার | फ़र्मवेयर | Прошивка | 固件 | Micrologiciel |
| Firmware update | تحديث البرنامج الثابت | ফার্মওয়্যার আপডেট | फ़र्मवेयर अपडेट | Обновление прошивки | 固件更新 | Mise à jour du micrologiciel |
| Compatibility checker | أداة فحص التوافق | সামঞ্জস্য পরীক্ষক | संगतता जांचकर्ता | Проверка совместимости | 兼容性检查工具 | Vérificateur de compatibilité |
| Installation guide | دليل التثبيت | ইনস্টলেশন গাইড | इंस्टॉलेशन गाइड | Руководство по установке | 安装指南 | Guide d'installation |
| User manual | دليل المستخدم | ব্যবহারকারী ম্যানুয়াল | उपयोगकर्ता मैनुअल | Руководство пользователя | 用户手册 | Manuel d'utilisation |
| Datasheet | ورقة البيانات | ডেটাশিট | डेटाशीट | Техническая документация | 数据手册 | Fiche technique |

---

## 7. Legal and Compliance Terms

| English Term | AR (Arabic) | BN (Bengali) | HI (Hindi) | RU (Russian) | ZH-CN (Chinese) | FR (French) |
|---|---|---|---|---|---|---|
| Privacy Policy | سياسة الخصوصية | গোপনীয়তা নীতি | गोपनीयता नीति | Политика конфиденциальности | 隐私政策 | Politique de confidentialité |
| Terms of Service | شروط الخدمة | সেবার শর্তাবলী | सेवा की शर्तें | Условия использования | 服务条款 | Conditions d'utilisation |
| Cookie Policy | سياسة ملفات تعريف الارتباط | কুকি নীতি | कुकी नीति | Политика использования файлов cookie | Cookie政策 | Politique de cookies |
| Data protection | حماية البيانات | ডেটা সুরক্ষা | डेटा सुरक्षा | Защита данных | 数据保护 | Protection des données |
| Personal data | البيانات الشخصية | ব্যক্তিগত তথ্য | व्यक्तिगत डेटा | Персональные данные | 个人数据 | Données personnelles |
| Data controller | مراقب البيانات | ডেটা কন্ট্রোলার | डेटा नियंत्रक | Оператор данных | 数据控制者 | Responsable du traitement |
| Data processor | معالج البيانات | ডেটা প্রসেসর | डेटा प्रोसेसर | Обработчик данных | 数据处理者 | Sous-traitant |
| Consent | الموافقة | সম্মতি | सहमति | Согласие | 同意 | Consentement |
| Opt out | الانسحاب | অপ্ট আউট | ऑप्ट आउट | Отказ | 退出 | Se désabonner |
| Right to erasure | حق المحو | মুছে ফেলার অধিকার | मिटाने का अधिकार | Право на удаление | 删除权 | Droit à l'effacement |
| GDPR | اللائحة العامة لحماية البيانات / GDPR [ABBR] | জিডিপিআর / GDPR | जीडीपीआर / GDPR | GDPR / РДПД | GDPR / 《通用数据保护条例》 | RGPD |
| UAE PDPL | قانون حماية البيانات الشخصية الإماراتي | ইউএই পিডিপিএল | यूएई पीडीपीएल | Закон ОАЭ о защите персональных данных | 阿联酋个人数据保护法 | Loi des EAU sur la protection des données |
| India DPDP Act | قانون حماية البيانات الرقمية الشخصية الهندي | ভারতীয় ডিপিডিপি আইন | भारत डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम | Закон Индии о защите цифровых персональных данных | 印度数字个人数据保护法 | Loi DPDP de l'Inde |
| Intellectual property | الملكية الفكرية | মেধাস্বত্ব | बौद्धिक संपदा | Интеллектуальная собственность | 知识产权 | Propriété intellectuelle |
| Copyright | حقوق النشر | কপিরাইট | कॉपीराइट | Авторское право | 版权 | Droit d'auteur |
| Trademark | علامة تجارية | ট্রেডমার্ক | ट्रेडमार्क | Торговая марка | 商标 | Marque déposée |

---

## 8. Regional Compliance Certification Terms

| English Term | AR (Arabic) | BN (Bengali) | HI (Hindi) | RU (Russian) | ZH-CN (Chinese) | FR (French) | Notes |
|---|---|---|---|---|---|---|---|
| CE marking | علامة CE | CE মার্কিং | सीई मार्किंग | Маркировка CE | CE认证 | Marquage CE | EU conformity — keep "CE" |
| RoHS | RoHS [ABBR] | RoHS [ABBR] | RoHS [ABBR] | RoHS [ABBR] | RoHS | RoHS | Restriction of Hazardous Substances |
| REACH | REACH [ABBR] | REACH [ABBR] | REACH [ABBR] | REACH [ABBR] | REACH | REACH | EU chemical regulation |
| FCC | FCC [ABBR] | FCC [ABBR] | FCC [ABBR] | FCC [ABBR] | FCC | FCC | US standard |
| EAC | EAC [ABBR] / علامة EAC | EAC | EAC | ЕАС / Знак EAC | EAC | EAC | Eurasian Conformity |
| BIS | BIS [ABBR] / مكتب المعايير الهندي | বিআইএস / BIS | बीआईएस / BIS | BIS | BIS | BIS | Bureau of Indian Standards |
| ISO 9001:2015 | ISO 9001:2015 [DNT] | ISO 9001:2015 [DNT] | ISO 9001:2015 [DNT] | ISO 9001:2015 [DNT] | ISO 9001:2015 [DNT] | ISO 9001:2015 [DNT] | Always keep as-is |
| UKCA | UKCA [ABBR] | UKCA [ABBR] | UKCA [ABBR] | UKCA [ABBR] | UKCA | UKCA | UK Conformity Assessed |
| Certified | معتمد | সার্টিফাইড | प्रमाणित | Сертифицирован | 认证 | Certifié | |

---

## 9. Marketing and Brand Terms

| English Term | AR (Arabic) | BN (Bengali) | HI (Hindi) | RU (Russian) | ZH-CN (Chinese) | FR (French) |
|---|---|---|---|---|---|---|
| High performance | أداء عالٍ | উচ্চ কার্যক্ষমতা | उच्च प्रदर्शन | Высокая производительность | 高性能 | Haute performance |
| Gaming | ألعاب / جيمنج | গেমিং | गेमिंग | Игровой | 游戏 | Gaming |
| Professional | احترافي | পেশাদার | पेशेवर | Профессиональный | 专业 | Professionnel |
| Enterprise | مؤسسي | এন্টারপ্রাইজ | एंटरप्राइज | Корпоративный | 企业级 | Entreprise |
| Creator | منشئ المحتوى / كريتر | ক্রিয়েটর | क्रिएटर | Создатель контента | 创作者 | Créateur |
| Reliability | الموثوقية | নির্ভরযোগ্যতা | विश्वसनीयता | Надёжность | 可靠性 | Fiabilité |
| Performance | الأداء | পারফরমেন্স | प्रदर्शन | Производительность | 性能 | Performance |
| Speed | السرعة | গতি | गति | Скорость | 速度 | Vitesse |
| Upgrade | ترقية | আপগ্রেড | अपग्रेड | Апгрейд / Обновление | 升级 | Mise à niveau |
| Technology | تكنولوجيا | প্রযুক্তি | प्रौद्योगिकी | Технология | 技术 | Technologie |
| Innovation | ابتكار | উদ্ভাবন | नवाचार | Инновация | 创新 | Innovation |
| Solution | حل | সমাধান | समाधान | Решение | 解决方案 | Solution |
| Global | عالمي | বৈশ্বিক | वैश्विक | Глобальный | 全球 | Mondial |
| Trusted | موثوق | বিশ্বস্ত | विश्वसनीय | Доверенный | 可信赖的 | De confiance |
| Award-winning | حائز على جوائز | পুরস্কার বিজয়ী | पुरस्कार विजेता | Отмеченный наградами | 获奖 | Primé |
| Optimised for gaming | محسّن للألعاب | গেমিংয়ের জন্য অপ্টিমাইজড | गेमिंग के लिए अनुकूलित | Оптимизирован для игр | 专为游戏优化 | Optimisé pour le gaming |

---

## 10. Navigation and Category Labels

| English Term | AR (Arabic) | BN (Bengali) | HI (Hindi) | RU (Russian) | ZH-CN (Chinese) | FR (French) |
|---|---|---|---|---|---|---|
| Memory | ذاكرة | মেমোরি | मेमोरी | Память | 内存 | Mémoire |
| Storage | تخزين | স্টোরেজ | स्टोरेज | Накопители | 存储 | Stockage |
| USB | USB [DNT] | USB [DNT] | USB [DNT] | USB [DNT] | USB [DNT] | USB [DNT] |
| Buying guide | دليل الشراء | ক্রয় গাইড | खरीदारी गाइड | Руководство по выбору | 购买指南 | Guide d'achat |
| Explainer | شرح | ব্যাখ্যামূলক | व्याख्याता | Объяснение | 解说 | Explicatif |
| Benchmark | اختبار الأداء | বেঞ্চমার্ক | बेंचमार्क | Бенчмарк / Тест производительности | 性能测试 | Benchmark |
| Glossary | المسرد | শব্দকোষ | शब्दावली | Глоссарий | 术语表 | Glossaire |
| Knowledge base | قاعدة المعرفة | নলেজ বেস | ज्ञानकोश | База знаний | 知识库 | Base de connaissances |
| Compatibility checker | فاحص التوافق | সামঞ্জস্য পরীক্ষক | संगतता जांचकर्ता | Проверка совместимости | 兼容性检查器 | Vérificateur de compatibilité |
| Solutions | الحلول | সমাধান | समाधान | Решения | 解决方案 | Solutions |
| Regional | إقليمي | আঞ্চলিক | क्षेत्रीय | Региональный | 区域 | Régional |
| Legal | قانوني | আইনি | कानूनी | Правовая информация | 法律 | Mentions légales |
| Company | الشركة | কোম্পানি | कंपनी | Компания | 公司 | Entreprise |
| Leadership | القيادة | নেতৃত্ব | नेतृत्व | Руководство | 领导团队 | Direction |
| Press | الصحافة | প্রেস | प्रेस | Пресса | 新闻中心 | Presse |
| Distributor | موزع | পরিবেশক | वितरक | Дистрибьютор | 经销商 | Distributeur |
| Partner | شريك | অংশীদার | साझेदार | Партнёр | 合作伙伴 | Partenaire |

---

## 11. Translation Memory Guidelines

### 11.1 What Is Stored in TM

The TwinMOS Translation Memory stores all approved translated segments from completed projects. A "segment" is a sentence, list item, heading, or short block of UI text.

The TM enables:
- **Exact match (100%)** — identical source segment found in TM; apply approved translation directly (always verify for context)
- **Fuzzy match (75–99%)** — similar segment found; use as starting point and adapt
- **No match (<75%)** — translate from scratch

### 11.2 TM Maintenance Rules

1. **Only approved translations enter the TM.** Do not add unreviewed AI output to TM directly.
2. **Context must be preserved.** The same English phrase may have different translations depending on context (e.g., "memory" as hardware vs. "memory" as recall). Tag segments with context notes in the CAT tool.
3. **Do-not-translate terms must be locked** in the TM and CAT tool settings — they should never be altered during TM lookups.
4. **Update TM after every accepted batch.** The vendor delivers an updated TMX file with each completed batch; TwinMOS imports it into the master TM.
5. **Conflicting translations:** If a segment has two different translations in TM from different projects, escalate to Localization Lead for a canonical decision. The decision is added as a glossary entry and the conflicting TM entry is corrected.

### 11.3 TM Version Control

The master TM files are stored at: `Backblaze B2: twinmos-translations/tm/{locale}/twinmos-tm-{locale}-v{version}.tmx`

- Version increments on each accepted batch.
- Previous versions are retained (never deleted) for audit purposes.
- Current version table:

| Locale | Current TM Version | Last Updated |
|---|---|---|
| AR | 1.0 (baseline) | May 2026 |
| BN | 1.0 (baseline) | May 2026 |
| HI | 1.0 (baseline) | May 2026 |
| RU | 1.0 (baseline) | May 2026 |
| ZH-CN | 1.0 (baseline) | May 2026 |
| FR | 1.0 (baseline) | May 2026 |

---

## 12. Glossary Maintenance and Governance

### 12.1 Change Request Process

When a new term needs to be added or an existing term corrected:

1. **Vendor** submits a Terminology Query CSV (columns: Source Term | Proposed Translation | Target Language | Context | Rationale | Urgency).
2. **Localization Lead** reviews within 3 business days.
3. If approved: term added to this document (TWN-F4-GLOSSARY-2026-001) and to the shared TBX/CAT glossary.
4. If rejected: Localization Lead provides the correct term and rationale.
5. Vendor back-fills the approved term in previously delivered content if the segment recurs ≥5 times.

### 12.2 Glossary Owner and Review Cadence

| Role | Responsibility | Cadence |
|---|---|---|
| Localization Lead | Primary owner; approves all changes | Review every change request within 3 business days |
| Marketing Director | Approves brand-voice terms; signs off on marketing copy terms | Monthly review of pending terms |
| Product Manager | Approves technical product terms | On-demand (per new product launch) |
| Legal Counsel | Approves legal and compliance terms | Annually or when regulation changes |
| Regional Manager (per locale) | Approves cultural and regional terms | Quarterly; mandatory for new phase launch |
| Translation Vendor | Submits new terms; updates TM | Per batch |

### 12.3 Annual Glossary Review

Every January, the Localization Lead conducts an annual review:
- Remove terms for discontinued products
- Update translations for any changed technical standards
- Reconcile TM against glossary for consistency
- Distribute updated glossary to all active vendors

---

## 13. Tool Integration Notes

This glossary is designed to be compatible with the following professional CAT tools:

### 13.1 memoQ

- Import terminology as a **memoQ Termbase** (TBX or CSV import)
- Lock do-not-translate terms using memoQ's "Forbid" column in the termbase
- TM: Import TMX via **Translations → Import TMX**
- QA: Enable "Termbase inconsistency" check in QA settings

### 13.2 SDL Trados Studio

- Import terminology as a **MultiTerm termbase** (TBX import via MultiTerm Convert)
- Use MultiTerm's "Forbidden Translation" field for do-not-translate terms
- TM: Import TMX via **Translation Memories → Import**
- QA: Enable "Terminology verification" in the QA Checker settings

### 13.3 Phrase TMS (formerly Memsource)

- Import terminology as a **Phrase Term Base** (TBX or XLSX import)
- Mark do-not-translate terms with "Forbidden" flag
- TM: Import TMX via **Translation Memories → Import**
- QA: Enable "Terminology" check in QA settings

### 13.4 DeepL API (AI Pre-Translation)

- Use the DeepL API's **Glossary feature** to protect do-not-translate terms:
  ```json
  {
    "name": "TwinMOS DNT Terms",
    "source_lang": "EN",
    "target_lang": "AR",
    "entries": "TwinMOS\tTwinMOS\nVOLTX\tVOLTX\nCoreX Pro\tCoreX Pro"
  }
  ```
- Create a separate glossary per language pair
- Apply the glossary ID in all API translation calls

---

*Document End — TWN-F4-GLOSSARY-2026-001 v1.0*
