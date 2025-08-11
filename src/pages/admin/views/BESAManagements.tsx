
import { useState, useEffect } from 'react';
import { X, User, Save } from 'lucide-react';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '/Users/arely/BESABooking/BESABooking/src/firebase.ts';
// import { mockBesas } from '../../../../data/mockData.ts';

type BesaType = {
  id: string;          
  name: string;
  email: string;
  role: string;
  status: string;
  toursThisWeek?: number;
  totalTours?: number;
};

export default function BESAManagementView() {
  const [besas, setBesas] = useState<BesaType[]>([]);
  const [selectedBesa, setSelectedBesa] = useState<string | null>(null);
  const [showNewBesaModal, setShowNewBesaModal] = useState(false);
  const [newBesa, setNewBesa] = useState({
    name: '',
    email: '',
    role: 'BESA',
    status: 'active',
  });

  useEffect(() => {
    const fetchBesas = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Besas"));
        const besasData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            email: data.email,
            role: data.role,
            status: data.status,
            toursThisWeek: data.toursThisWeek ?? 0,
            totalTours: data.totalTours ?? 0,
          } as BesaType;
        });
        setBesas(besasData);
      } catch (error) {
        console.error("Error fetching BESAs from Firestore:", error);
      }
    };

    fetchBesas();
  }, []);

  const updateBesaField = (
    id: string,
    field: 'name' | 'email' | 'role' | 'status',
    value: string
  ) => {
    setBesas(prevBesas =>
      prevBesas.map(besa =>
        besa.id === id ? { ...besa, [field]: value } : besa
      )
    );
  };

  const handleAddNewBesa = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const docRef = await addDoc(collection(db, 'Besas'), {
      ...newBesa,
      toursThisWeek: 0,
      totalTours: 0,
      officeHours: defaultOfficeHours,
    });
    setBesas(prev => [...prev, { id: docRef.id, ...newBesa, toursThisWeek: 0, totalTours: 0 }]);
    setShowNewBesaModal(false);
    setNewBesa({ name: '', email: '', role: 'BESA', status: 'active' });
  } catch (error) {
    console.error("Error adding new BESA:", error);
    alert('Failed to add new BESA. Please try again.');
  }
};

const defaultOfficeHours = {
  monday:    { available: false, start: '', end: '' },
  tuesday:   { available: false, start: '', end: '' },
  wednesday: { available: false, start: '', end: '' },
  thursday:  { available: false, start: '', end: '' },
  friday:    { available: false, start: '', end: '' },
  saturday:  { available: false, start: '', end: '' },
  sunday:    { available: false, start: '', end: '' }
};

const saveBesaChanges = async () => {
  if (selectedBesa === null) return;
  try {
    const besaToUpdate = besas.find(b => b.id === selectedBesa);
    if (!besaToUpdate) return;

    const besaDocRef = doc(db, 'Besas', besaToUpdate.id);

    await updateDoc(besaDocRef, {
      name: besaToUpdate.name,
      email: besaToUpdate.email,
      role: besaToUpdate.role,
      status: besaToUpdate.status,
      officeHours: defaultOfficeHours,
    });

    setSelectedBesa(null); 
  } catch (error) {
    console.error('Error updating BESA in Firestore:', error);
    alert('Failed to save changes. Please try again.');
  }
};



  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        {/* Besa Management Header*/}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">BESA Management</h1>
          <p className="text-gray-600">Manage BESA accounts and permissions</p>
        </div>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          onClick={() => setShowNewBesaModal(true)}>
          <User className="h-4 w-4" />
          <span>Add New BESA</span>
        </button>
      </div>

      {/* Besa Table Display */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BESA</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">This Week</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Tours</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {besas.map((besa) => (
                <tr key={besa.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{besa.name}</div>
                        <div className="text-sm text-gray-500">{besa.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${besa.role === 'BESA Lead' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                      {besa.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {besa.toursThisWeek}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {besa.totalTours}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${besa.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                      {besa.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => setSelectedBesa(besa.id)}
                      className="text-blue-600 hover:text-blue-900">
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={async () => {
                        if (window.confirm(`Are you sure you want to deactivate and delete ${besa.name}? This action cannot be undone.`)) {
                          try {
                            const besaDocRef = doc(db, 'Besas', besa.id);
                            await deleteDoc(besaDocRef);
                            setBesas(prev => prev.filter(b => b.id !== besa.id));
                          } catch (error) {
                            console.error('Error deleting BESA:', error);
                            alert('Failed to delete BESA. Please try again.');
                          }
                        }
                      }}>
                      Deactivate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Button: The Display */}
      {selectedBesa && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  Edit BESA: {besas.find(b => b.id === selectedBesa)?.name}
                </h3>
                <button
                  onClick={() => setSelectedBesa(null)}
                  className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Edit Form */}
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      value={besas.find(b => b.id === selectedBesa)?.name || ''}
                      onChange={(e) => updateBesaField(selectedBesa, 'name', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      value={besas.find(b => b.id === selectedBesa)?.email || ''}
                      onChange={(e) => updateBesaField(selectedBesa, 'email', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      value={besas.find(b => b.id === selectedBesa)?.role || 'BESA'}
                      onChange={(e) => updateBesaField(selectedBesa, 'role', e.target.value)}
                    >
                      <option value="BESA">BESA</option>
                      <option value="BESA Lead">BESA Lead</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      value={besas.find(b => b.id === selectedBesa)?.status || 'active'}
                      onChange={(e) => updateBesaField(selectedBesa, 'status', e.target.value)}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </form>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => setSelectedBesa(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                <button
                  onClick={saveBesaChanges}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Add New BESA Button Window */}
      {showNewBesaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Add New BESA</h3>
              <button
                onClick={() => setShowNewBesaModal(false)}
                className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Change State to be on click*/}
            <form onSubmit={handleAddNewBesa}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={newBesa.name}
                  onChange={e => setNewBesa({ ...newBesa, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={newBesa.email}
                  onChange={e => setNewBesa({ ...newBesa, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={newBesa.role}
                  onChange={e => setNewBesa({ ...newBesa, role: e.target.value })}
                >
                  <option value="BESA">BESA</option>
                  <option value="BESA Lead">BESA Lead</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={newBesa.status}
                  onChange={e => setNewBesa({ ...newBesa, status: e.target.value })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={() => setShowNewBesaModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add BESA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


