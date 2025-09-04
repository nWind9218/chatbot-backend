const express = require('express');
const {
  createApiKey,
  getUserApiKeys,
  getOrganizationApiKeys,
  getApiKeyById,
  updateApiKey,
  regenerateApiKey,
  deleteApiKey,
  getApiKeyUsage,
} = require('../controllers/apiKeyController');
const { authenticate, requireOrganizationMember } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   POST /api/v1/api-keys
 * @desc    Create new API key
 * @access  Private
 */
router.post('/', authenticate, createApiKey);

/**
 * @route   GET /api/v1/api-keys
 * @desc    Get user's API keys
 * @access  Private
 */
router.get('/', authenticate, getUserApiKeys);

/**
 * @route   GET /api/v1/api-keys/:apiKeyId
 * @desc    Get API key by ID
 * @access  Private
 */
router.get('/:apiKeyId', authenticate, getApiKeyById);

/**
 * @route   PUT /api/v1/api-keys/:apiKeyId
 * @desc    Update API key
 * @access  Private
 */
router.put('/:apiKeyId', authenticate, updateApiKey);

/**
 * @route   POST /api/v1/api-keys/:apiKeyId/regenerate
 * @desc    Regenerate API key
 * @access  Private
 */
router.post('/:apiKeyId/regenerate', authenticate, regenerateApiKey);

/**
 * @route   DELETE /api/v1/api-keys/:apiKeyId
 * @desc    Delete API key
 * @access  Private
 */
router.delete('/:apiKeyId', authenticate, deleteApiKey);

/**
 * @route   GET /api/v1/api-keys/:apiKeyId/usage
 * @desc    Get API key usage statistics
 * @access  Private
 */
router.get('/:apiKeyId/usage', authenticate, getApiKeyUsage);

/**
 * Organization API keys routes
 */

/**
 * @route   GET /api/v1/organizations/:organizationId/api-keys
 * @desc    Get organization API keys
 * @access  Private (Organization Member)
 */
router.get(
  '/organizations/:organizationId/api-keys',
  authenticate,
  requireOrganizationMember(['OWNER', 'ADMIN', 'MEMBER']),
  getOrganizationApiKeys
);

module.exports = router;
