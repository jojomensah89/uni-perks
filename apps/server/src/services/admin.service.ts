import * as adminRepo from "../repositories/admin.repository";

export const adminService = {
    /**
     * Get all deals for admin dashboard
     */
    getAllDeals: adminRepo.getAllDealsForAdmin,

    /**
     * Create a new deal
     */
    createDeal: adminRepo.createDeal,

    /**
     * Update an existing deal
     */
    updateDeal: adminRepo.updateDeal,

    /**
     * Soft delete a deal
     */
    deleteDeal: adminRepo.deleteDeal,

    /**
     * Toggle featured status
     */
    toggleFeatured: adminRepo.toggleFeatured,

    /**
     * Set deal expiration date
     */
    setDealExpiration: adminRepo.setDealExpiration,
};
