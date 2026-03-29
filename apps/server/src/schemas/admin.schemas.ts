import { z } from "@hono/zod-openapi";

const SlugSchema = z
    .string()
    .min(2)
    .max(200)
    .regex(/^[a-z0-9-]+$/);

const DiscountTypeSchema = z.enum(["percent", "fixed", "other"]);

const ConditionsSchema = z
    .union([z.array(z.string().max(500)).max(20), z.string().max(5000)])
    .optional()
    .nullable();

const ExpiresAtSchema = z
    .union([z.string().datetime(), z.number().int(), z.null()])
    .optional();

const AffiliateLinkSchema = z
    .string()
    .url()
    .max(2000)
    .optional()
    .nullable()
    .or(z.literal("").transform(() => null));

export const CreateDealSchema = z.object({
    slug: SlugSchema,
    title: z.string().min(2).max(500),
    shortDescription: z.string().max(500),
    longDescription: z.string().max(5000).optional().nullable(),
    brandId: z.string().uuid(),
    categoryId: z.string().uuid(),
    discountType: DiscountTypeSchema,
    discountLabel: z.string().max(100),
    discountValue: z.number().min(0).max(100).optional().nullable(),
    originalPrice: z.number().min(0).optional().nullable(),
    currency: z.string().length(3).default("USD"),
    claimUrl: z.string().url().max(2000),
    affiliateLink: AffiliateLinkSchema,
    coverImageUrl: z.string().max(500).optional().nullable(),
    howToRedeem: z.string().max(5000).optional().nullable(),
    termsUrl: z.string().url().max(2000).optional().nullable().or(z.literal("").transform(() => null)),
    minimumSpend: z.number().min(0).optional().nullable(),
    isFeatured: z.boolean().default(false),
    status: z.enum(["pending", "approved", "rejected", "published", "archived"]).default("pending"),
    hotnessScore: z.number().int().min(1).max(100).optional().default(50),
    conditions: ConditionsSchema,
    expiresAt: ExpiresAtSchema,
    metaTitle: z.string().max(70).optional().nullable(),
    metaDescription: z.string().max(160).optional().nullable(),
});

export const UpdateDealSchema = CreateDealSchema
    .partial()
    .omit({ slug: true });

export const ApproveDealSchema = z.object({
    approvedAt: z.number().int().optional(),
});

export const CreateBrandSchema = z.object({
    name: z.string().min(1).max(200),
    slug: SlugSchema,
    tagline: z.string().max(300).optional().nullable(),
    description: z.string().max(2000).optional().nullable(),
    website: z.string().url().max(500).optional().nullable().or(z.literal("").transform(() => null)),
    logoUrl: z.string().max(500).optional().nullable(),
    coverImageUrl: z.string().max(500).optional().nullable(),
    whyWeLoveIt: z.string().max(1000).optional().nullable(),
    isVerified: z.boolean().default(false),
    metaTitle: z.string().max(70).optional().nullable(),
    metaDescription: z.string().max(160).optional().nullable(),
});

export const UpdateBrandSchema = CreateBrandSchema.partial().omit({ slug: true });

export const CreateCategorySchema = z.object({
    name: z.string().min(1).max(200),
    slug: SlugSchema,
    icon: z.string().max(100).optional().nullable(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable().or(z.literal("").transform(() => null)),
    coverImageUrl: z.string().max(500).optional().nullable(),
    displayOrder: z.number().int().min(0).default(0),
    metaTitle: z.string().max(70).optional().nullable(),
    metaDescription: z.string().max(160).optional().nullable(),
});

export const UpdateCategorySchema = CreateCategorySchema.partial().omit({
    slug: true,
});

export const CreateCollectionSchema = z.object({
    name: z.string().min(1).max(200),
    slug: SlugSchema,
    description: z.string().max(2000).optional().nullable(),
    audience: z.string().max(100).optional().nullable(),
    isFeatured: z.boolean().optional().default(false),
    displayOrder: z.number().int().min(0).optional().default(0),
    coverImageUrl: z.string().max(500).optional().nullable(),
    icon: z.string().max(100).optional().nullable(),
    metaTitle: z.string().max(70).optional().nullable(),
    metaDescription: z.string().max(160).optional().nullable(),
});

export const UpdateCollectionSchema = CreateCollectionSchema.partial().omit({
    slug: true,
});

export const UpdateSuggestionSchema = z.object({
    brandName: z.string().min(1).max(100).optional(),
    dealTitle: z.string().min(1).max(200).optional(),
    description: z.string().min(1).max(2000).optional(),
    discountLabel: z.string().min(1).max(100).optional(),
    claimUrl: z.string().url().max(500).optional(),
    category: z.string().min(1).max(50).optional().nullable(),
    resolvedBrandId: z.string().uuid().optional().nullable(),
    resolvedCategoryId: z.string().uuid().optional().nullable(),
    status: z.enum(["pending", "approved", "rejected"]).optional(),
    rejectionReason: z.string().max(500).optional().nullable(),
});

export const ApproveSuggestionSchema = z.object({
    slug: SlugSchema,
    brandId: z.string().uuid(),
    categoryId: z.string().uuid(),
    discountType: DiscountTypeSchema.default("other"),
    discountValue: z.number().min(0).max(100).optional().nullable(),
    isFeatured: z.boolean().default(false),
});
