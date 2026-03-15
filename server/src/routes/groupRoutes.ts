import { Router } from 'express';
import {
    acceptInvitation,
    addMember,
    createGroup,
    deleteGroup,
    getGroup,
    getGroups,
    getPendingInvitations,
    inviteUser,
    removeMember,
    searchUsers,
    updateGroup,
} from '../controllers/groupController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

// Search route must come BEFORE :groupId parameter route
router.get('/search/users', searchUsers);

// Invitation routes - must come before :groupId
router.get('/invitations/pending', getPendingInvitations);
router.post('/invitations/:token/accept', acceptInvitation);

router.post('/', createGroup);
router.get('/', getGroups);
router.get('/:groupId', getGroup);
router.put('/:groupId', updateGroup);
router.post('/:groupId/members', addMember);
router.post('/:groupId/invite', inviteUser);
router.delete('/:groupId/members', removeMember);
router.delete('/:groupId', deleteGroup);

export default router;
