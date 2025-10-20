import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '../store';
import { fetchHouseholds, createHousehold, deleteHousehold, leaveHousehold } from '../store/slices/householdSlice';
import Layout from '../components/Layout';
import Modal from '../components/Modal';

const Households = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { households, loading } = useSelector((state: RootState) => state.households);
  const { user } = useSelector((state: RootState) => state.auth);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [householdName, setHouseholdName] = useState('');

  useEffect(() => {
    dispatch(fetchHouseholds());
  }, [dispatch]);

  const handleCreateHousehold = async (e: React.FormEvent) => {
    e.preventDefault();
    if (householdName.trim()) {
      await dispatch(createHousehold(householdName));
      setHouseholdName('');
      setIsModalOpen(false);
    }
  };

  const handleLeaveHousehold = async (id: string, createdBy: string) => {
    if (createdBy === user?.id) {
      alert('You cannot leave a household you created. Delete it instead.');
      return;
    }
    if (window.confirm('Are you sure you want to leave this household?')) {
      await dispatch(leaveHousehold(id));
    }
  };

  const handleDeleteHousehold = async (id: string, createdBy: string) => {
    if (createdBy !== user?.id && user?.role !== 'admin') {
      alert('Only the creator can delete this household.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this household? This action cannot be undone.')) {
      await dispatch(deleteHousehold(id));
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Households</h1>
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
            Create Household
          </button>
        </div>

        <div className="card">
          <p className="text-gray-600">
            Households allow you to share expenses with family members or roommates. Create a household to get started!
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading households...</p>
          </div>
        ) : households.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {households.map((household) => {
              const isCreator = household.createdBy._id === user?.id || household.createdBy.id === user?.id;
              return (
                <div key={household._id} className="card hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">{household.name}</h3>
                    {isCreator && (
                      <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                        Creator
                      </span>
                    )}
                  </div>

                  <div className="space-y-3 mb-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Members ({household.members.length})</p>
                      <div className="space-y-1">
                        {household.members.slice(0, 3).map((member: any) => (
                          <p key={member._id || member.id} className="text-sm text-gray-700">
                            • {member.name}
                          </p>
                        ))}
                        {household.members.length > 3 && (
                          <p className="text-sm text-gray-500">+ {household.members.length - 3} more</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">
                        Created by: {household.createdBy.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <button
                      onClick={() => navigate(`/households/${household._id}`)}
                      className="btn btn-primary flex-1 text-sm"
                    >
                      View Details
                    </button>
                    {isCreator || user?.role === 'admin' ? (
                      <button
                        onClick={() => handleDeleteHousehold(household._id, household.createdBy._id || household.createdBy.id)}
                        className="btn btn-danger text-sm"
                      >
                        Delete
                      </button>
                    ) : (
                      <button
                        onClick={() => handleLeaveHousehold(household._id, household.createdBy._id || household.createdBy.id)}
                        className="btn btn-secondary text-sm"
                      >
                        Leave
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card text-center py-12">
            <p className="text-gray-500 mb-4">No households yet</p>
            <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
              Create Your First Household
            </button>
          </div>
        )}

        {/* Create Household Modal */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Household">
          <form onSubmit={handleCreateHousehold} className="space-y-4">
            <div>
              <label className="label">Household Name</label>
              <input
                type="text"
                required
                value={householdName}
                onChange={(e) => setHouseholdName(e.target.value)}
                className="input"
                placeholder="e.g., Family, Roommates, etc."
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button type="submit" className="btn btn-primary flex-1">
                Create Household
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setHouseholdName('');
                }}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default Households;

