import { z } from "@hono/zod-openapi";

const SlugSchema = z
    .string()
    .min(2)
    .max(200)
    .regex(/^[a-z0-9-]+$/);

const DiscountTypeSchema = z.enum(["percentage", "fixed", "free", "trial", "bogo", "other"]);
const VerificationMethodSchema = z.enum([
    "edu_email",
    "sheerid",
    "unidays",
    "student_beans",
    "student_id",
    "github_student",
    "isic",
    "none",
]);

const ConditionsSchema = z
    .union([z.array(z.string().max(500)).max(20), z.string().max(5000)])
    .optional()
    .nullable();

const ExpirationDateSchema = z
    .union([z.string().datetime(), z.number().int(), z.null()])
    .optional();

export const CreateDealSchema = z.object({
    slug: SlugSchema,
    title: z.string().min(2).max(500),
    shortDescription: z.string().min(10).max(500),
    longDescription: z.string().min(10).max(5000),
    brandId: z.string().uuid(),
    categoryId: z.string().uuid(),
    discountType: DiscountTypeSchema,
    discountLabel: z.string().max(100),
    discountValue: z.number().min(0).max(100).optional().nullable(),
    originalPrice: z.number().min(0).optional().nullable(),
    studentPrice: z.number().min(0).optional().nullable(),
    currency: z.string().length(3).default("USD"),
    verificationMethod: VerificationMethodSchema,
    claimUrl: z.string().url().max(2000),
    affiliateUrl: z.string().url().max(2000).optional().nullable(),
    coverImageUrl: z.string().max(500).optional().nullable(),
    howToRedeem: z.string().max(5000).optional().nullable(),
    eligibilityNote: z.string().max(1000).optional().nullable(),
    termsUrl: z.string().url().max(2000).optional().nullable(),
    minimumSpend: z.number().min(0).optional().nullable(),
    isFeatured: z.boolean().default(false),
    isActive: z.boolean().default(true),
    isExclusive: z.boolean().default(false),
    isNewCustomerOnly: z.boolean().default(false),
    conditions: ConditionsSchema,
    expirationDate: ExpirationDateSchema,
    metaTitle: z.string().max(70).optional().nullable(),
    metaDescription: z.string().max(160).optional().nullable(),
});

export const UpdateDealSchema = CreateDealSchema.partial().omit({ slug: true });

export const CreateBrandSchema = z.object({
    name: z.string().min(1).max(200),
    slug: SlugSchema,
    tagline: z.string().max(300).optional().nullable(),
    description: z.string().max(2000).optional().nullable(),
    website: z.string().url().max(500).optional().nullable(),
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
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable(),
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
