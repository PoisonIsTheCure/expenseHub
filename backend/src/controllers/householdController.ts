import { Response } from 'express';
import { Household } from '../models/Household';
import { User } from '../models/User';
import { AuthRequest } from '../types';

export const getAllHouseholds = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    // Get households where user is a member
    const households = await Household.find({ members: userId })
      .populate('members', 'name email')
      .populate('createdBy', 'name email');

    res.json({ households });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const createHousehold = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    // Create household with creator as first member
    const household = await Household.create({
      name,
      createdBy: userId,
      members: [userId],
    });

    // Update user's householdId
    await User.findByIdAndUpdate(userId, { householdId: (household._id as any).toString() });

    const populatedHousehold = await Household.findById(household._id)
      .populate('members', 'name email')
      .populate('createdBy', 'name email');

    res.status(201).json({
      message: 'Household created successfully',
      household: populatedHousehold,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getHouseholdById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const household = await Household.findById(req.params.id)
      .populate('members', 'name email')
      .populate('createdBy', 'name email');

    if (!household) {
      res.status(404).json({ message: 'Household not found' });
      return;
    }

    // Check if user is a member
    const userId = req.user?.id;
    if (!household.members.some((member: any) => member._id.toString() === userId)) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    res.json({ household });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateHousehold = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    const userId = req.user?.id;

    const household = await Household.findById(req.params.id);
    
    if (!household) {
      res.status(404).json({ message: 'Household not found' });
      return;
    }

    // Only creator or admin can update
    if (household.createdBy.toString() !== userId && req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Only household creator can update' });
      return;
    }

    if (name) household.name = name;
    await household.save();

    const populatedHousehold = await Household.findById(household._id)
      .populate('members', 'name email')
      .populate('createdBy', 'name email');

    res.json({
      message: 'Household updated successfully',
      household: populatedHousehold,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteHousehold = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const household = await Household.findById(req.params.id);

    if (!household) {
      res.status(404).json({ message: 'Household not found' });
      return;
    }

    // Only creator or admin can delete
    if (household.createdBy.toString() !== userId && req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Only household creator can delete' });
      return;
    }

    // Remove householdId from all members
    await User.updateMany(
      { _id: { $in: household.members } },
      { $unset: { householdId: '' } }
    );

    await Household.findByIdAndDelete(req.params.id);

    res.json({ message: 'Household deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const joinHousehold = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const household = await Household.findById(req.params.id);

    if (!household) {
      res.status(404).json({ message: 'Household not found' });
      return;
    }

    // Check if already a member
    if (household.members.includes(userId!)) {
      res.status(400).json({ message: 'Already a member of this household' });
      return;
    }

    // Add user to household
    household.members.push(userId!);
    await household.save();

    // Update user's householdId
    await User.findByIdAndUpdate(userId, { householdId: (household._id as any).toString() });

    const populatedHousehold = await Household.findById(household._id)
      .populate('members', 'name email')
      .populate('createdBy', 'name email');

    res.json({
      message: 'Joined household successfully',
      household: populatedHousehold,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const leaveHousehold = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const household = await Household.findById(req.params.id);

    if (!household) {
      res.status(404).json({ message: 'Household not found' });
      return;
    }

    // Check if user is a member
    if (!household.members.includes(userId!)) {
      res.status(400).json({ message: 'Not a member of this household' });
      return;
    }

    // Creator cannot leave without deleting the household
    if (household.createdBy.toString() === userId) {
      res.status(400).json({ 
        message: 'Creator cannot leave household. Delete it instead.' 
      });
      return;
    }

    // Remove user from household
    household.members = household.members.filter(
      (member) => member.toString() !== userId
    );
    await household.save();

    // Remove householdId from user
    await User.findByIdAndUpdate(userId, { $unset: { householdId: '' } });

    res.json({ message: 'Left household successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

