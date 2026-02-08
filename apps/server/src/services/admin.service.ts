import * as adminRepo from "../repositories/admin.repository";

export const adminService = {
    /**
     * Get all perks for admin dashboard
     */
    getAllPerks: adminRepo.getAllPerksForAdmin,

    /**
     * Create a new perk
     */
    createPerk: adminRepo.createPerk,

    /**
     * Update an existing perk
     */
    updatePerk: adminRepo.updatePerk,

    /**
     * Soft delete a perk
     */
    deletePerk: adminRepo.deletePerk,

    /**
     * Toggle featured status
     */
    toggleFeatured: adminRepo.toggleFeatured,

    /**
     * Set perk expiration date
     */
    setPerkExpiration: adminRepo.setPerkExpiration,
};
