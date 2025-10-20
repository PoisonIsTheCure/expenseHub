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

export const addMemberByEmail = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const userId = req.user?.id;
    const household = await Household.findById(req.params.id);

    if (!household) {
      res.status(404).json({ message: 'Household not found' });
      return;
    }

    // Only creator or admin can add members
    if (household.createdBy.toString() !== userId && req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Only household creator can add members' });
      return;
    }

    // Find user by email
    const userToAdd = await User.findOne({ email: email.toLowerCase() });
    if (!userToAdd) {
      res.status(404).json({ message: 'User not found with this email' });
      return;
    }

    const userToAddId = (userToAdd._id as any).toString();

    // Check if already a member
    if (household.members.includes(userToAddId)) {
      res.status(400).json({ message: 'User is already a member of this household' });
      return;
    }

    // Add user to household
    household.members.push(userToAddId);
    await household.save();

    // Update user's householdId
    await User.findByIdAndUpdate(userToAddId, { householdId: (household._id as any).toString() });

    const populatedHousehold = await Household.findById(household._id)
      .populate('members', 'name email')
      .populate('createdBy', 'name email')
      .populate('budget.contributions.userId', 'name email');

    res.json({
      message: 'Member added successfully',
      household: populatedHousehold,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const removeMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { memberId } = req.params;
    const userId = req.user?.id;
    const household = await Household.findById(req.params.id);

    if (!household) {
      res.status(404).json({ message: 'Household not found' });
      return;
    }

    // Only creator or admin can remove members
    if (household.createdBy.toString() !== userId && req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Only household creator can remove members' });
      return;
    }

    // Cannot remove the creator
    if (household.createdBy.toString() === memberId) {
      res.status(400).json({ message: 'Cannot remove the household creator' });
      return;
    }

    // Check if user is a member
    if (!household.members.includes(memberId)) {
      res.status(400).json({ message: 'User is not a member of this household' });
      return;
    }

    // Remove user from household
    household.members = household.members.filter(
      (member) => member.toString() !== memberId
    );
    await household.save();

    // Remove householdId from user
    await User.findByIdAndUpdate(memberId, { $unset: { householdId: '' } });

    const populatedHousehold = await Household.findById(household._id)
      .populate('members', 'name email')
      .populate('createdBy', 'name email')
      .populate('budget.contributions.userId', 'name email');

    res.json({
      message: 'Member removed successfully',
      household: populatedHousehold,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const addContribution = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { amount } = req.body;
    const userId = req.user?.id;
    const household = await Household.findById(req.params.id);

    if (!household) {
      res.status(404).json({ message: 'Household not found' });
      return;
    }

    // Check if user is a member
    if (!household.members.includes(userId!)) {
      res.status(403).json({ message: 'Only household members can add contributions' });
      return;
    }

    // Validate amount
    if (!amount || amount <= 0) {
      res.status(400).json({ message: 'Amount must be a positive number' });
      return;
    }

    // Initialize budget if it doesn't exist
    if (!household.budget) {
      household.budget = {
        monthlyLimit: 0,
        currency: 'EUR',
        contributions: [],
      };
    }

    // Add contribution
    household.budget.contributions.push({
      userId: userId!,
      amount,
      date: new Date(),
    });

    await household.save();

    const populatedHousehold = await Household.findById(household._id)
      .populate('members', 'name email')
      .populate('createdBy', 'name email')
      .populate('budget.contributions.userId', 'name email');

    res.json({
      message: 'Contribution added successfully',
      household: populatedHousehold,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getContributionStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const household = await Household.findById(req.params.id)
      .populate('members', 'name email')
      .populate('createdBy', 'name email')
      .populate('budget.contributions.userId', 'name email');

    if (!household) {
      res.status(404).json({ message: 'Household not found' });
      return;
    }

    // Check if user is a member
    if (!household.members.some((member: any) => member._id.toString() === userId)) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    // Calculate contribution statistics
    const contributions = household.budget?.contributions || [];
    const stats: any = {};

    // Total contributions by user
    contributions.forEach((contribution: any) => {
      const userIdStr = contribution.userId._id?.toString() || contribution.userId.toString();
      if (!stats[userIdStr]) {
        stats[userIdStr] = {
          user: contribution.userId,
          total: 0,
          count: 0,
          contributions: [],
        };
      }
      stats[userIdStr].total += contribution.amount;
      stats[userIdStr].count += 1;
      stats[userIdStr].contributions.push({
        amount: contribution.amount,
        date: contribution.date,
      });
    });

    // Convert to array and calculate percentages
    const totalContributions = Object.values(stats).reduce((sum: number, stat: any) => sum + stat.total, 0);
    const statsArray = Object.values(stats).map((stat: any) => ({
      ...stat,
      percentage: totalContributions > 0 ? (stat.total / totalContributions) * 100 : 0,
    }));

    res.json({
      household: {
        _id: household._id,
        name: household.name,
      },
      totalContributions,
      currency: household.budget?.currency || 'EUR',
      memberStats: statsArray,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateHouseholdBudget = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { monthlyLimit, currency } = req.body;
    const userId = req.user?.id;
    const household = await Household.findById(req.params.id);

    if (!household) {
      res.status(404).json({ message: 'Household not found' });
      return;
    }

    // Only creator or admin can update budget
    if (household.createdBy.toString() !== userId && req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Only household creator can update budget' });
      return;
    }

    // Initialize budget if it doesn't exist
    if (!household.budget) {
      household.budget = {
        monthlyLimit: 0,
        currency: 'EUR',
        contributions: [],
      };
    }

    if (monthlyLimit !== undefined) {
      if (monthlyLimit < 0) {
        res.status(400).json({ message: 'Monthly limit must be positive' });
        return;
      }
      household.budget.monthlyLimit = monthlyLimit;
    }

    if (currency) {
      const validCurrencies = ['EUR', 'USD', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'];
      if (!validCurrencies.includes(currency)) {
        res.status(400).json({ message: 'Invalid currency' });
        return;
      }
      household.budget.currency = currency;
    }

    await household.save();

    const populatedHousehold = await Household.findById(household._id)
      .populate('members', 'name email')
      .populate('createdBy', 'name email')
      .populate('budget.contributions.userId', 'name email');

    res.json({
      message: 'Budget updated successfully',
      household: populatedHousehold,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

